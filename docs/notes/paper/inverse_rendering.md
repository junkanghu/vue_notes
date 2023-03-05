# Inverse rendering

<link rel="stylesheet" href="/katex.min.css">

[[toc]]

## Physg: Inverse Rendering with Spherical Gaussians for Physics-based Material Editing and Relighting

### problems in previous works 
1. Neural rendering methods work well for the task of interpolating novel views, but do not factorize appearance into lighting and materials, precluding physically-based appearance manipulation like material editing or relighting.
2. 

### innovation


### limitation
1. Don't model self-occlusion or indirect illumination.
2. 

### overview
1. MLP for SDF function.
2. SGs for environment map which represents the environment light.
3. BRDF consists of spatially varying diffuse albedo and a shared monochrome isotropic specular component. The diffuse albedo $a$ is calculated by a MLP $\Phi$.
   That is:
   $$
   f_r(\omega_o, \omega_i;x) = \frac{a}{\pi} + f_s(\omega_o, \omega_i;x)
   $$
   where:
   $$
   f_s(\omega_o, \omega_i;x) = M(\omega_o, \omega_i)D(h)
   $$
   In the BRDF euqtion, $f_s$ is represented by SGs. Besides, $\omega_i\cdot n$ is represented by a SG.

---

## Modeling Indirect Illumination for Inverse Rendering

### some conceptions
1. ray-sphere intersection
   ![explainment](/images/sphere_intersection.png)
   Here, the center of the sphere is at the origin of world coordinate. So, $Q=P$.
   ``` python
    cam_loc = cam_loc.unsqueeze(-1)
    # directions are world coordinates
    ray_cam_dot = torch.bmm(ray_directions, cam_loc).squeeze()
    under_sqrt = ray_cam_dot ** 2 - (cam_loc.norm(2,1) ** 2 - r ** 2)

    # Here the center of the sphere is the origin of the world coordinate
    under_sqrt = under_sqrt.reshape(-1)
    mask_intersect = under_sqrt > 0  # These ones greater than 0 can intersect sphere.

    sphere_intersections = torch.zeros(n_imgs * n_pix, 2).cuda().float()
    sphere_intersections[mask_intersect] = \
        torch.sqrt(under_sqrt[mask_intersect]).unsqueeze(-1) * torch.Tensor([-1, 1]).cuda().float()
    sphere_intersections[mask_intersect] -= ray_cam_dot.reshape(-1)[mask_intersect].unsqueeze(-1)
   ```
   In the code, *under_sqrt* is $\frac{b^2}{4} - ac$. To calculate for t, we have
   $$
   t = \frac{-b\pm \sqrt \Delta}{2a}
   $$
   We can know from the code that ```torch.sqrt(under_sqrt[mask_intersect]) * torch.Tensor([-1, 1])``` gets $\pm \Delta$. So by addition, we get the two ts.
2. 

### problems in previous work
1. Previous capture systems, such as light-stages with controlled light directions and cameras [8, 11, 31], using a colocated flashlight and camera in a dark room [2, 3], and rotating objects with a turntable [7, 26], **show limitations in user-friendliness**.
2. Methods capturing objects under natural illumination often show complex effects such as soft shadows and interreflections. Prior methods usually ignore both selfocclusion and interreflection [29] in order to reduce computation, or only model visibility [32] or limit the indirect lighting to a single bounce with known light sources. As a result, the effect of indirect illumination in the captured images is prone to being baked into the estimated diffuse albedo to compensate for this gap.
3. Single-image inverse rendering methods rely heavily on the strong prior of the planar geometry. They can effectively infer plausible materials and normal maps from a single image but usually cannot recover **spatially-varying 3D representations** of these factors.

### limitations
1. Strongly relies on fine geometry as an input. We cannot deal with the case where the geometry fails to be reconstructed.
2. We parameterize BRDF with fixed F0 = 0.02 in the Fresnel term. In other words, we assume that the recovered materials are dielectric.

---

## IRON: Inverse Rendering by Optimizing Neural SDFs and Materials from Photometric Images

### innovation
1. Compared to IDR、Nerf、Neus etc. that entangle lighting and meterial, this work can disentangle them.
2. Previous works don't consider the derivative of edge points, leading to inability to deform shape along the edge normals.
   
![edge](/images/edge_inalbility.png)

In this figure, under the single viewpoint condition, algorithms without computing edge derivative along normal directions are not able to defrom the shape along normal directions.（也就是在初始化的sdf下，没办法把shape往normal的方向拉，因为reparamterization时只考虑沿着ray direction的方向去优化）
3. Be able to rendering sub-pixels.

### methodology
1. 首先用IDR的方式训练一个sdf net和一个neural radiance field net。
2. 然后同时训练albedo（第一步的neural radiance field作为初始化）、roughness、specular、sdf、point light，并以GGX model进行rendering。

### details
1. 作者使用co-located camera和light（point light）拍摄，并在计算时将point light的位置近似和camera center相同，这样使得view direction和light direction相同（差个符号）。这种近似在object较远的时候误差会较小。
![co-located](/images/co-located.png)
2. 作者使用一个点光源来近似light，并采用inverse-square fall-off对光源的强度进行建模。
3. 当view direction与surface normal垂直时，代表我们看到的是object的edge。
4. 比较重要的一个关于梯度计算的点：我们计算loss时本质上是要从loss back-propagate 到net weights的，但是在这里因为x的获得不是differential的，所以梯度没办法通过x back-propagate到network的weights中，因此需要reparameterize x。本质上来说要reparameter x，需要保证构造的equation在当前参数下的值($S_{\Theta}, n_0$)等于$x_0$，且当前参数下的梯度等于未构建实体equation而通过implicit function计算时的first-order梯度（因为算weight gradient时用的都是first-order），因此后续才有构造一个equation证明这两点的推导。
5. 只对edge-pixels进行walk process来找edge surface points，而找这种edge pixels，是通过ray-tracing得到每一个pixel的depth之后，给每个pixel附上这个depth值，然后算Sobel 梯度，梯度较大的pixel说明其与周围的pixel之间存在depth突变，则其为edge pixels。
6. Figure 2、4想要告诉我们的点时，在一个view point上进行训练时，IDR由于只计算演着view direction方向的t变化，导致shape只会在view direction方向被伸缩，而没办法往edge normal的方向伸缩，因此无法将一个初始化的sdf shape在edge normal方向慢慢通过优化拉伸变大。但事实上在multi-view训练时，由于每个viewpoint都几乎会被扫到，所以整个shape可以朝向各个方向被伸缩，最终达到准确的shape。


### limitation


### some conceptions
1. **edge pixel & interior pixel & subpixel**
   * **edge pixel**: where shading colors is a combination if colors at disconnected surface pieces.

    ![edge_pixels](/images/edge_pixels.jpg)

   * **interior pixel**: pixels whose content comes from smooth and continuous surface

   * **subpixel**: a small area inside a pixel
2. photometric images: camera and light is co-located.
3. 可以讲3D normal投影到2D images形成2D normal map。


### tricks


### mathematical derivation
1. walk step
![walk](/images/IRON_algo.jpg)

---

## NeRV: Neural Reflectance and Visibility Fields for Relighting and View Synthesis

### innovation
1. 相对于NeRF，解决了NeRF不能恢复material和进行relighting的缺点。
2. 相对于一些传统方法，又可以利用NeRF重建3D model。
3. 虽然NeRF in the wild采用appearance code来表示每一张image的lighting可以进行某种程度上的relighting，但是它不能利用一些新的lighting而只能用学到的lighting。

### Methodology
前提：global illumination中，只衡量一次弹射。
定义：三个MLP
   1. 一个MLP输出每个point x的volume density $\sigma$，输入为x的坐标。（这里将volume density作为shape的表示，其实也可以理解，因为density越大的地方代表着有物体，空气的density小）
   2. 一个MLP输出每个point x的diffuse albedo（这里默认每个point没有specular分量来简化）和roughness。（遵循microfacet模型），输入为x的坐标。
   3. 一个MLP输出在某个点沿着某个方向的visibility（衡量能不能看到light source，看得到light source时可利用这个MLP输出的visibility来计算radiance，看不到时认为是打到了物体上，被物体遮挡，此时可使用这个MLP的termination depth）和termination depth（从这个点到termination的距离）。这里的visibility其实就是NeRF中的transmittance（即volume density的积分），在NeRF中认为某个点的transmittance越低，其radiance（rgb）传输到camera的比例越少。
方法：
   1. 传到某一个camera pixel的radiance（rgb）由两部分组成，一个是direct illumination，一个是indirect illumination。
   2. 对某个pixel的渲染还是采用NeRF在ray上sample点的方式。不同的是，在NeRF中通过MLP获得每个点的rgb值，即认为每个点自己含有能量，能够emit radiance；但是在NeRV中，认为每个点本身不含能量，它们的能量来源于别的光线，即每个点朝向pixel发射的radiance来源于反射（遵循PBR）。
   3. 对于direct分量来说：先算出ray上每个sample的点的reflectance作为NeRF中的rgb值，然后根据MLP得出每个点的volume density，然后根据NeRF中的方式获得ray的rgb值。每个点的reflectance通过PBR获得，incident light由light source直接产生（在sample点的hemisphere上采样入射光方向），然后将这个incident radiance与visibility（MLP获得）相乘作为最终到达sample点的radiance；diffuse albedo和roughness由MLP获得，然后根据microfacet模型产生BRDF；点的normal通过对density的MLP进行求导获得（方式与SDF net一样。可以这么理解这个normal的计算，在sdf中sdf=0代表着某个surface，而对ƒ求导代表着surface的normal；在这里density=m代表着某个surface，故用其对coordinate求导也代表着normal）；最终对采样的入射光方向积分获得最终的朝向pixel的reflectance。
   4. 对于每个indirect分量来说：不再对ray上的每个sample点计算refletance，然后根据volume rendering获得rgb值。而是认为每条光线最终会打到一个hard surface上产生一个intersection（它有一个depth），然后对这个intersection进行PBR产生一个reflectance（incident light不来源于light source而是来源于被light source照射到的点，因此light到intersection时已经是第二次反射，这才成为indirect），这个reflectance就类似于surface rendering的rgb值。在这里，这个depth遵循NeRF中计算depth的方式（仅将volume rendering中的rgb值换成每个sample点的depth值，rgb权重大的点，其depth的权重也大）。而有了depth后，就可以计算这个intersection的坐标。得到坐标后，在这个intersection的hemisphere上采样m条光线，将intersection坐标和m条光线的方向输入visibility MLP来计算每条光线的termination depth $t''$，根据这个$t''$和m条光线方向可以计算出m个termination的坐标。这m个termination都可能获得light source的radiance（由MLP产生的visibility来衡量是否能接收到light source的radiance），然后再根据PBR产生m个reflectance作为intersection的入射光线，然后在intersection处做PBR，输出的reflectance作为pixel的indirect分量。

---

## NRF：Neural Reflectance Fields for Appearance Acquisition

### innovation

#### problems in previous work
1. Nerf之类的工作只能用于view synthesis，并没有将scene appearance model为reflectance和lighting的相互作用。因此也就没办法用于relighting、scene editing。
2. voxel-based 方法由于memory（resolution）的限制，没办法model high-frequency information。

#### improvement
1. Based on Nerf， this work can be used for relighting。

### methodology

#### training
1. 利用一个MLP，输入point coordinate，输出该point的density、normal和计算BRDF的参数（基于不同的BRDF计算模型输出不同的参数）。
2. 利用ray marching，在pixel对应的ray上进行sampling（同nerf），然后将sample points输入MLP得到上述参数。
3. 利用这些参数算出任何一个sample point的transmittance，先用这个transmittance算出light到该point的intensity（$L_i(x,\omega_{i})=\tau_{l}(x)L_l(x)$），然后利用该点的BRDF参数算出BRDF，然后用BRDF、normal、incident light、light direction（同view direction）根据PBR算出该点沿着camera ray方向射向camera的radiance（nerf中不经过如此复杂的建模过程，而是直接用MLP获得这个radiance）。
4. 得到ray上每个点的radiance后，再利用nerf的方法进行rendering（根据sampling进行coarse-to-fine）。

#### testing
由于在training中co-located的设定，算camera和light transmittance时，只需要算一组就行，因为camera ray和light ray的direction是相同的。但是在test时由于我们希望获得放在任意位置的light point照射下的relighting结果，因此为了节省memory，我们需要pre-compute transmittance volume，然后在rendering的时候直接通过query和interpolation方式直接获得某个点的transmittance。本质上来说，导致traning和testing需要进行不同operation的原因就是，保证light transmittance的计算。

1. 将test setting下的point light作为一个virtual camera的center，然后在其面前放一个image plane（plane离light的距离，即virtual camera的focal length需要保证virtual camera能够看到整个object）作为virtual camera，利用这个virtual camera做ray marching。
2. 利用training阶段得到的coarse和fine network（用于sample point）对virtual camera的每个pixel进行ray marching，在sample point处算出它的transmittance然后存储。
3. 在rendering阶段，对camera ray进行ray marching时，每个sample point的light transmmitance可以这样获得：根据step 2存储的transmittance volume，寻找离当前sample point最近的n个已在step 2算出的point的transmittance进行linear interpolation。
4. 得到light transmittance之后就可以算出light到某个sample point的intensity，进而进行rendering。


### details
1. 由于camera和light是co-located的，因此针对某一个point，camera ray和light ray的direction是一致的，因此算camera transmittance和light transmittance时，它们是相同的，不需要重复算。

---

## Learning Neural Transmittance for Efficient Rendering of Reflectance Fields

### innovation


### methodology

### details

---

## Total Relighting: Learning to Relight Portraits for Background Replacement

### innovation

#### problems in previous work

#### improvements

### brif summary

### introduction 
1. 介绍relighting的背景：什么是relighting（Compositing a person into a scene to look like they are really there）；其应用（smartphone photography、video conferencing、film-making）；介绍了film-making的具体做法，指出其无法保证light-consistency（新背景下的object看起来跟真的处于背景之中一样）。
2. 列举了一些工作：relighting、estimate alpha matting and foreground colors、consider both foreground estimation and composite。指出它们由于lack explicit relighting step而无法得到photorealistic的结果。
3. 介绍light stage做relighting的方法。指出其hardware成本高。（每个object都需要扫一组，但是TR只需要用synthetic数据train一个net就可以做到对每个object的估计）
4. 介绍自己的工作。

### related work
1. image-based relighting
2. portrait relighting
3. alpha matting
4. our approach

### methodology

---

## Acquiring the Reflectance Field of a Human Face

### methodology
1. 用light stage拍摄OLAT照片。（light stage的灯覆盖了整个球面，其相当于一条按序点亮的灯带，按照经度绕完一圈后就按维度往下一点。每个灯的位置以$\theta \phi$表示，最终获得64*32个灯照明下的image）
![light_stage](/images/light_stage.png)
2. 对于每个camera view，记录当前camera view下每个pixel在64\*32个灯下的值，组成一张64*32的image，代表在当前view下，这个pixel对应的3D point在每个light下的reflectance。因为我们不知道3D点的normal，所以没办法用physical model来建模，但是我们在当前pixel看到的value是下面式子中除了$L_i$外的所有内容，而$L_i$是一个scale，所以相当于我们记录下了其它所有值的信息（在当前camera view下保持不变）。因此可以通过控制$L_i$的大小获得最终结果。
$$
L_o=\int{L_i \cdot f \cdot cos\theta \cdot \omega_{i}}
$$
总的来说，这张64*32的image代表了对于某个pixel来说，每个光照下的reflectance，其乘以illumination即可得到每个光照下的rendering结果，若全相加，代表是所有灯下的rendering结果。
3. 上述可以做到在某个view下的relighting结果，但是做不到在novel view下的结果。此方法后续通过用cross-polarization将specular和diffuse分开来，然后再进行novel view下的relighting。

---

## Lumos: Learning to Relight Portrait Images via a Virtual Light Stage and Synthetic-to-Real Adaptation

### innovation

### brief summary
Based on TR(total rendering), Lumos modifys the rendering network, takes two different types of normal maps for generating glass glares and performs synthetic-to-real adaption by training an albedo-refine network based on the observation that domain gap between synthetic and real data mainly comes from the diversity of the subject albedo.

### methodology
1. 合成数据（具有不同的hairstyles、clothing、accessories、face materials，主要的face scan和mesh来源于购买的商业数据）。
2. 将total relighting最后的rendering network decompose开来，使其不至于成为一个black-box（将最后的relight结果分为coarse和fine，fine是在coarse的基础上加上一个residual）。并且采用了
   1. 利用一个netwrok $f_R$学一个diffuse coefficients和一个specular coefficients以及一个relit residual（$C_d,C_s,\delta R=f_R(I,A,L_d,L_s)$）将diffuse light map和specular light map通过它们对应的coefficients 线性结合得到一个最终的light map，然后将这个light map与albedo 进行element-wise的相乘得到coarse relit结果
   2. 第一步中的specular light map $L_s$也与total relighting不一样。TR中采取specular lobe n=1，16，32，64几种，但是在Lumos中还加上了n=1024专门为了处理眼睛镜片上的glare。在TR中将几种不同n的specular light map结合是直接采用network结合的（black-box），但在Lumos中是学习各个分量的weight然后线性相加。此外n=1024的specular light map的生成不是通过query TR中的normal map得到的，而是query Lumos中独有的一个normal 得到的。
   3. Lumos通过$f_N$估计两个normal map，一个是有眼镜镜片的normal $N_l$，一个是没有的normal $N$，当label没有眼镜时，控制这两个normal一样，有镜片时可以根据gt监督生成不同的normal。step 2中就是用这个$N_l$去生成lobe n=1024的light map。
   4. 将1中的residual$\delta R$加到coarse结果上，就可以生成fine relit结果。（在算loss时对这个residual加了一个regularization loss使其逼近0，防止学出来的residual替代原来的coarse结果直接对fine结果起了最主要作用）
3. synthetic-to-real adaption
   1. 所有之前的network的参数都保持不变，在此基础上加一个优化albedo的network去实现这个adaption（优化albedo是因为观察到synthetic和real之间的gap主要在于real data中的albedo具有多样性，而synthetic中难以覆盖到这种多样性，所以需要用real data来训练这个albedo network）。
   2. 将这个albedo network嵌入到原来的pipeline中，是通过将原来的albedo和image以及normal输入到网络估计一个residual，然后加到albedo上形成新的albedo。然后将这个新的albedo用于后续的pipeline中实现。（$\delta \overline{A}=f_{\overline{A}}(I,N,A);\overline{A}=A+\delta \overline{A}$）
4. train albedo net时的Loss分析
   1. Lighting consistency loss: 在light stage中认为，两个光源同时照明下得到的image，可以通过分别采用这两个光源得到的image相加获得。这一点在物理场景（light stage）中是遵守的，即这一property是符合现实世界的，因此**为了让model更加接近现实理论，以及能够在后续rendering中使用单个点光源（只有一个pixel是有光的environment map）也能进行rendering（在project video中可以看到point light下的rendering结果）**，加上了这个loss。这个loss通过在每一个iteration中，任意取两张只有一个pixel亮的environment map（模拟light stage中的点光源）分别去rendering，然后再取一张这两个pixel都亮的environment map去rendering，优化它们之间的loss。（将environment map中某个pixel的值保持不变，其余的都设置为0去模拟点光源）
   2. Relative lighting consistency loss：这样来理解：为了使得这个network只学习albedo细节部分的优化，而不去改变light作用下的效果（如果不去考虑这个regularization，为了保持最后relit的结果与gt尽量相似，network可能会改变rendering时本来单独属于light部分的作用以去逼近gt），考虑保持两个environment map作用下的差异不变（用两个environment map去渲染，这两个map渲染下的image，除了light变了，其它都没变，故将它们做差，这个差异展现的仅仅只是rendering时light改变后的差异，其余部分不变）。在优化albedo之后再算这个loss，可以保证network优化的只是albedo的细节，但是保证rendering时light对整张image所发挥的那部分作用不变。（可以认为其余network已经学出了在rendering时，单纯改变light时所能呈现的不同效果；因此优化后仍要保持这种效果）。（在rendering中，各部分参数都发挥各自的作用，这个loss能够使得rendering equation中属于light的那部分作用不被baked into albedo中，使得它们的作用entangle在一起，故起到了disentangle的作用）
   3. Similarity loss：为了防止优化后的albedo与原来的偏差太大，加一个regularization。其利用VGG去获得$A 和\overline{A}$的高维semantic信息算loss（高维semantic可以忽略detail）
   4. Identity loss：使用一个face recgonition net获取脸部的high-level features，保证脸部不变（similarity是对整个albedo算，其中既含有脸部，也含有clothing等）。
   5. GAN loss：使得relit结果更photo-realistic。
5. train video：
   1. 在本方法中造成video不连续（flickering）的原因是pipeline中的某些部分在frame之间变化的过快（本文注意到主要是normal和albedo变化过快）。因此分别加一个albedo net和一个normal net来对这种差异进行smooth（rendering时其余部分的参数都不变）
   2. albedo net和normal net都是通过输入上一个frame的$A$以及$N$和当前frame的这两个分量来估计一个residual $\delta A$和$\delta N$，然后将这个residual加到当前frame的结果得到最终的值。
   3. Loss分析（仅针对这两个net）:
      1. Similarity loss：同上使用VGG，然后算loss，防止deviation过多。
      2. Identity loss：同上使用face recognition net算loss。
      3. Warping loss：在两个frame最终rendering后的image之间用外部方法算一个optical flow$W$（可以理解为一种transformation），然后将其用于上一个frame，获得当前frame应该得到的结果，在实际rendering出来的结果和这个warping后的结果之间算loss。这个loss可以保证在motion上的连续性。
6. 

### details
1. 3D face scans在https://triplegangers.com/ 上获得（可以获得4K diffuse texture和face geometry）。因为这个face mesh是unstructured的，所以需要用ICP将其对齐到一个坐标系中，获得其精确的坐标。

### 思考
Lumos使用了非常多的loss，比如在synthetic-to-real adaption中使用的对residual加一个regularization loss，本来或许可以用于所有residual，但是可能在experiment中作者发现某些地方加可能对实际效果有提升，于是最终就加了上去，有些地方没有提升，所以就没有加。

---

## Neural Video Portrait Relighting in Real-time via Consistency Modeling

### usage
1. 获得face parsing的方法
2. optical flow library
3. 如何计算parsing loss（binary cross entropy）

### innovation

#### problems in previous work
1. 对于video portrait relighting，之前要么用昂贵的设备去做，要么就是过于费时，没办法做到real-time。
2. 许多基于monocular RGB inverse rendering的learning方法，它们的效果过于low-quality。
3. 一些image-to-image的方法只基于single image做，无法在video上保证连续。
4. 某些方法没办法做到environment light的任意editing。

#### improvements
1. real-time
2. temporally coherent
3. new dataset(OLAT)
4. enable dynamic environment map（scene editing）


### brief summary
xxx first disentangles the lighting and the structure in a semantic-aware manner， and then using triplets of training samples generated from their lighting condition sampling stage to model the illumination consistency and mutation for relighting under natutal environment.

## thinking process
1. 目的：做一个支持dynamic illuminations的video的relighting。
2. 难点：
   1. 没有数据集：自己用OLAT生成
   2. 需要解决temporal consistency：temporal stage
3. 搭建思路
   1. 如何操纵light，像DPR一样在Unet的bottleneck处生成predicted light或加入target light。
   2. 这样train出来的结果，在脸部的不同区域（眼睛、眉毛）等几乎有一样的材质，原因是网络无法感知semantic information，因此加一个parsing输出，使得网络能够aware。
   3. 这样输出的结果，可能导致了structure的不够稳定（脸部geometry），因此再加一个latent structure code的self-supervised的loss，使其更加准确。
   4. 基本框架已经搭好，接下去就是要model temporal了。由于用的是OLAT数据集，本身自带temporal信息，因此可以用OLAT的相邻两帧信息做flow loss。但是相邻两帧用了不同的envmap去做relighting生成了training数据，所以用了共轭方式交换light，使得场景抑制，即可做flow loss。
   5. 这样生成的结果在natural-captured videos上生成的结果，帧与帧之间not consistency，可能的原因是training samples与natural video不一致（相邻两帧的envmap完全不一致，网络可能难以学习），因此要结合拍摄的video的特性来考虑解决这个问题：拍摄的video所处的环境光可能是high-frequency的，也可能是low-frequency的，因此数据集也要有这样的样本。于是有了后面的lighting conditions sampling stage。

### methodology
1. 因为脸部不同部分的材质不同，如果没有语义信息的先验，网络会平等对待它们，导致最后relighting结果出现artifacts。因此加了一个parsing loss，使得网络能够semantic-aware，生成semantic-consistency的结果（即不同脸部材质区域展现不同结果的效果）。
2. 本文的训练数据集是OLAT拍摄的，因此拍摄的image之间自然存在着时序信息（由控制设备预先定义），也就存在着可以计算optical flow的source pairs。但是OLAT images被用于做不同的relighting去生成用于train的relighting pairs，所以即使它们之间存在着时序，但是image content不同，无法直接加flow loss。
3. lighting conditions sampling的目的：
   1. 做的事情就是生成temporal training stage的training sample，即生成其中的输入的相邻两帧的relit images和target relit image。对于OLAT images来说，就是生成三个lighting condition来做linear addition生成relit images。
   2. 本文的目的是对naturally captured videos进行relighting，在这样的video中，相邻两帧的images的environment map是不同（脸部的任何微小转动使得虽然场景的envmap是不变的，但是射向脸部的light变了，即envmap做了一个旋转，类似于变成了另外一种envmap），而这种不同取决于当前场景，如果当前场景的整体envmap比较平滑，这种变化就小，否则当一个非常强或非常弱的光源开始射向脸部时，这种变化就非常大，这两种效应分别被作者成为consistency和mutation。因此在后续生成相邻两帧的envmap时，采用Beta distribution可以保证相邻两帧的images的light condition变化很小（因为Beta distribution的pdf是两头大中间小，即生成的值大概率趋向于0或1，而不是0.4、0.5，这就使得结合两张images时，大部分的值来源于一张envmap，小部分的值来源于另一张envmap，来模拟lighting的微小变化）。这样不仅模拟了natural环境的consistency，也使得temporal training更加稳定，因为相似的pattern容易被学到。
   3. 而对于lighting的mutation效应进行model时，作者把light stage上的光源到object的距离等效为1个单位，然后在距离object 1.5个单位的地方随机生成1-3个light point with random color，然后将它们投影到sphere上形成一张新的envmap以模拟mutation的envmap（这也是合理的，因为natural环境中，可能产生mutation的就是个别point light）。然后在所有生成的这种envmap中采样，combine到之前的envmap上，模拟mutation的target envmap。

---

## Single Image Portrait Relighting

### usage
1. 较为详细的用envmap结合light stage生成数据集的过程。
2. OLAT tracking frames

### innovation

#### problems in previous work
1. 之前生成不同lighting的image需要资深摄影师控制相机参数，非常复杂。
2. physical-model-based inverse rendering方法，需要假设material（例如Lambertian）或者illumination（SH、SG），这不一定符合真实的情况。
3. 

#### improvements
1. 因为不需要假设material和illumanation，本方法不会受到physical model的限制。

### brief summary
SIPR takes an encoder-decoder architecture to generate relit images from a single input image, which enables both estimating light and editing light in the bottleneck.

### methodology
1. 运用light stage生成OLAT dataset，然后利用HDR environment map去生成数据。（HDR environment map的每个pixel代表light stage中的某个光源，而基于light可以相加的特性，可以把environment map中的每个pixel代表的光源映射到light stage的light上，然后将那些image线性相加）。
2. 网络结构为encoder-decoder，输入为single image，然后在bottleneck中输出estimated light并加入target light。在decoder处可以获得relit image。
3. Loss
   1. image loss：relit image和gt算loss（利用mask只算foreground）
   2. illumination loss：将estimated light与gt算loss（需要乘上每个pixel的solid angle）
   3. re-rendering loss：将estimated light作为target light重新输入bottleneck，然后算relit image和input的loss。

4. 估计light时为什么要用confidence map：对于某一张输入的image，如果其只含有脸颊左侧的内容，则用它去直接推测全局的environment map肯定是不合理的，它只能推测到envmap的左侧。在bottleneck处的feature的每个pixel的位置都对应着输入网络的image的某一小块（receptive view），这一小块encode了envmap某一块的信息，因此我们可以对每一个feature pixel回归一张envmap以及同分辨率的confidence（用来表示生成的envmap的每个pixel的可靠性），然后利用所有的confidence map对所有的envmap做weighted average。这样能够赋予网络更自由的能力去根据每一块区域估计envmap。
---

## Single Image Portrait Relighting via Explicit Multiple Reflectance Channel Modeling

### usage
1. 一个img-to-img relighting数据集。
2. 如何获得gt shadow map和specular map。
3. 在train不同stage时，可以先用前面stage的gt输入后面stage，使得后面stage收敛到一定程度。

### innovation

#### problems in pervious work
1. light stage之类采集数据的方法对用户不友好。虽然也有方法采用data distribution transfer的方法生成数据，但弊病是computational cost和poor performance wrt. specular and shadow。
2. 有一些end-to-end的training方法，并没有explicitly consider specular and shadow，没法学出比较好的效果。
3. 缺少explicitly考虑specular和shadow的supervision。

#### improvements
1. 针对1和2，explicitly modeling specular和shadow等reflectance。
2. 针对3，创建了一个dataset。

### brief summary
Different from previous works using end-to-end neural networks, this paper explicitly models multiple reflectance channels(normal, albedo, parsing, shadow, specular) for single image portrait relighting, which is demonstrated to be effective for challenging effects like specular and shadow.

### methodology
1. 将input image输入De-lighting network，得到parsing、albedo、normal和predicted lighting。parsing不参与后续pipeline，这样做是模仿single image portrait relighting，为了使得网络能够更好地区分face的各个region，以获得更好的albedo；predicted light的生成方式也同single image portrait relighting，在bottleneck采用一个weighted average得到lighting，这个lighting也不用于后续的pipeline，作者说这样做可以增强训练稳定性。（**在这里，albedo和normal（geometry）被认为是intrinsic channels**）。
2. step 1得到的normal和target lighting被输入SS network去获得shadow和specular（因为shadow和specular主要是由light和geometry决定的）。在SS network中为了确保light和geometry能够更好地发生作用，采用了一个LFM module（本质是一个self-attention）。
3. 最后将albedo、normal、shadow、specular、target light输入composition network得到最终的relight结果。

### detail
1. 采用均匀光照照射脸部（洗干净没有油），以此直接拍摄multi-view images（拍到的就是albedo）。
2. 利用商业软件*PhotoScan*和1中拍摄的images生成geometry（mesh）和texture map（albedo）。
3. 利用template将mesh align到确定的坐标系下获得确定的pose信息。(在MVS中是用过feature point将新的camera registrate到已经获得的世界坐标系中；但是在这里并不是以image的feature points去registrate，因为这里没有image，只有mesh，故只是用了一种mesh的registrate方法获得当前mesh的camera-to-world pose)
4. 利用*Blender*中的*Cycles rendering engine*和*BSDF shader*做渲染：
   1. texture map被直接当成albedo输入其中。
   2. 根据经验设置roughness=0.6，specular=0.5以渲染gt。
   3. 在2的基础上设置specular=0进行渲染，然后将gt与没有specular的image相减得到specular map；在2的基础上设置shadow visibility=False进行渲染，与gt相减，然后转为grayscale获得shadow map（visualization时取inverse）。
   4. 在texture map的基础上，manually选取不同的8个区域作为semantic（parsing） map。
5. 在training时separately train各个network：
   1. warm-up：先根据supervision train De-lighting net，然后train SS和composition。在train SS和composition时，SS的input使用的是gt albedo和light，composition的input使用全是gt。
   2. 对De-lighting进行fine-tune：输入SS和composition的都是network predict的结果。首先对De-lighting net进行fine-tune（保持SS和composition不变）。（这样理解：在warm-up中，SS和composition的输入都是gt，所以它们在优化后都已经收敛了，只有De-lighting还未完全收敛，因此只需要对其进行fine-tune。换句话说，如果一开始将De-lighting的结果直接输入后续的net，训练就会较慢，或者说难以收敛。）
   3. Note：
      1. 作者将同一个light下的multiple reflectance channel称为一个group($G=\{I, l, I_n, I_{sp}, I_{sh}, N, P\}$)。在warm up时只需要一个group的内容即可：I是用l relighting得到的，因此将I输入De-lighting net后，得到的estimated light, parsing, albedo, normal都可以直接用group中的内容进行监督；而在train SS时，输入SS的light为group中的gt light l和gt normal N, 得到的shadow和specular用group中的内容监督；train composition net时，输入其中的albedo, normal, shadow, specular, light（没有其余的target light，只有input的gt light）全部来源于group。
      2. 但是在fine tune阶段，由于需要target light，因此需要两个group（除了light及其导致的不同的shadow和specular，其余都相同）来train。
   4. 

---

## DPR：Deep Single-Image Portrait Relighting

### usage
1. 对high-resolution training images，可以先downsample在low reso images上train，然后在high-relo images上fine-tune。
2. 可以用SfSNet（SfSNet: Learning Shape, Reflectance and Illuminance of Faces in the Wild.）来估计一张image的SH lighting。
3. 若要生成synthetic relighting images：light和material之间的ambiguity可能导致relit结果不够photo-realistic，因此可以选择只在luminance channel进行PBR。
4. 估计portrait normal的方式：用3DDFA获得coarse normal，然后用ARAP-based normal refinement algorithm进行refine。
5. skip training：如果用unet结构，如果bottleneck的latent code需要encode一些重要的信息，则可以使用skip trainning，防止skip connection把过多的imformation pass到decoder中，使得bottleneck的信息过少。
6. 对于一个value（color light、albedo等），如果其由intensity和色温组成，如果只要求衡量色温之间的distance，而不用管intensity，可以用invariant Mean Squared Error（Si-MSE）。

### innovation

1. 现有的image-based relighting方法估计的face geometry和reflectance details可能不准，导致后续的relighting结果not photo-realistic。本文利用合成数据集先让network学习如何relighting，然后利用GAN（natural image作为positive label）去生成realistic的结果。
2. 第一个能够生成high-resolution images的方法（1024*1024）
3. 利用ratio image去合成数据集（material被简化为albedo去生成）。

### brief summary
DPR first generates a relighting dataset, then performs image-based relighting using an encoder-decoder architecture which manipulates SH-based lighting at the bottleneck.

### methodology
1. 利用Ratio Image-based Face Relighting方式生成relighting数据集（每张source image生成5张不同lighting下的relighting image）。
![ratio_image](/images/ratio_image.png)
其中R是albedo（文章假设人脸材质为albedo），f代表SH lighting和normal作用下的结果。
   1. 其中的normal根据自己的算法获得。
   2. source image的SH lighting通过SfSNet估计获得。
   3. target image的lighting通过在一个SH lighting数据集里面sample获得。
2. 网络使用Unet结构，在bottleneck处估计两个latent code，一个为$z_f$代表face information，$z_s$代表lighting feature（经过一个regression得到estimated SH lighting）。然后在bottleneck处输入target lighting，与$z_f$ concatenate输入decoder。
![dpr](/images/DPR.png)
3. loss：
   1. image loss：predicted image和gt之间的L1 loss以及两张image的Laplacian（二阶梯度代表high frequency内容，包括edges）之间的loss。
   2. GAN loss：由ratio image trick生成的dataset可能由于normal不准产生artifact，导致数据层面就有问题。注意到artifacts出现在local patch，因此加了patch GAN的loss去refine local detail。
   3. latent code loss：给任意两张source image（face相同，lighting不同）经过encoder得到$z_f$，算两个$z_f$之间的loss。这个loss代表face相同的两张image的face information应该相同。
4. training strategy：作者发现，如果一开始training就用skip connection，会导致被encoded在$z_f$中的face information减少，减少的information都是由于skip connection被分流出去。因此采用skip training方式，一开始先不用skip，然后随着iteration的增加逐步加skip connection直到最后全部加上去。

### new knowledge
1. 在同一个真实lighting condition下，相机过长的exposure time会导致image过亮，这可能导致估计SH时不准确（其根据image估计），即其无法反映真实的lighting condition。
---

## PhotoApp: Photorealistic Appearance Editing of Head Portraits

### innovation

#### problems in previous work
1. dense light stage成本高，且无法捕捉in-the-wild images中的variations。
2. 大多数supervised方法无法支持novel view，能支持novel view的方法并不photo-realistic。
3. 虽然styleGAN可以没有direct supervision（没有算gt和predicted的直接的pixel-wise loss，而是用别的网络提了feature然后算loss），但是存在loss of quality。
4. 基于OLAT的deep learning方法和Debevec那样的方法只能在inner face region实现好的效果，但是没办法在eyes和haircut方面实现好的效果。
5. synthetic（利用albedo什么的去生成，类似Lumos）方法影响了relighting结果的photo-realistic。

#### improvements
1. 针对1没有用dense light stage，只用到了8个camera和150个RGB light，然后利用environment map去生成数据集。
2. 针对2本方法实现了novel view。
3. 针对5，本方法使用的不是合成数据集。

### brief summary

### methodology
1. 将input image、target illumination、camera pose、binary input p（记录camera pose是否与input相同，用来控制相同pose下的内容一样）输入pspNet（pretrained，参数保持不变）得到18\*512的latent code。
2. 然后将得到的latent code分成18个512维的latent code，分别代表不frequency的features，针对每个separated latent code，有一个独立的PhotoApp net（以target illumination、camera pose、binary input p一起作为输入），得到不同frequency下的latent code，然后将它们concatenate输入styleGAN（pretrained，参数保持不变）得到relit image。（这里因为light stage用的是150个RGB light，所以environment map也应该是150*3的rgb image，这里将其flatten，成为450维的vector）。
3. loss：
   1. latent code loss：PhotoApp net将input image的latent representation映射为target image的latent representation，因此要与gt的latent representation算loss。
   2. perceptual loss：predicted relit image与gt之间首先经过Alexnet算一个feature，然后算loss。
4. 

---

## High-Res Facial Appearance Capture from Polarized Smartphone Images

### innovation

#### problems in previous work
1. light stage with polarizers采集数据来恢复材质的方法非常unfriendly to amateurs。

#### improvements
1. 只用一个手机采用cross-polarization和parallel-polarization的方法获得diffuse和specular分量（disentangle）。capture setting非常友好。

### introduction
1. 第一段：介绍背景。硬件发展地比较好，激发了做数字人的热潮。但是relighting under arbitrary viewpoints with different lighting conditions非常难。指出传统的用light stage的方法非常复杂（引出问题），因此本文章要在保证relighting结果较好的情况下简化capture process（最主要的创新点，简化了，且证明可行）。
2. 第二段：第一段只是用一句话说了light stage的复杂，第二段细化了这种setting是怎么做的，然后再次说明很复杂。
3. 第三段：引出自己的方法（拍摄简述，后续要得到albedo、specular等），首先就是强调拍摄简单（only a smart phone）。最后说明自己的方法产生的各种material参数，可以很好地支持一些工作，如editable等。
4. In summary，总结一下contributions：
   1. capture setting使得能够separate diffuse和specular。
   2. co-located camera和light（感觉不像contributions）
   3. coarse-to-fine optimization for texture of different resolution using mipmap。（可以提高texture的sharpness，即可以获得high-resolution的texture）

### related work
1. polarizaton：最大创新点。指出polarization的方法主要基于specular不改变polarization方向这个事实。然后列举了几篇文章的方法。
2. lightstage capture systems：先介绍light stage来源。然后指出问题：拍摄时间长；给muitiple camera和light设置polarizer非常challenging。然后列举一些利用light stage的方法。最后还是强调拍摄设备非常复杂。
3. differentiable rendering：指出recently work极大推动了relighting的发展。列举几篇这个方面的工作，指出他们侧重于shape reconstruction，但是本篇文章可以基于一些效果非常好的reconstruction方法去重建shape，可以更侧重于材质的恢复。再指出一些工作用complex lighting setting，不利于恢复材质。
4. deep learning-based approaches：列举一些用deep learning的方法。

summary：在介绍各种technics时，除了要介绍其基本原理，还要引出一些文章，最后能批判地要批判他们。

### brief summary
Due to the high cost of previous hardware, PolFace proposes to capture face data only via a smartphone with polarizers, which not only simplifys the cpature process, but ensures the accurate disentanglement of diffuse and specular material attributes.

### methodology
1. Data capture:
   1. 拍摄两段视频（一段cross-polarization、一段parrallel-polarization）和一些photographs，它们一起用于shape reconstruction。拍摄photograph是因为作者认为，photograph的质量更高，要用它来恢复材质，而video主要用于shape reconstruction。且所有拍摄的light均只来自于flashlight（近似于point light）。
   2. 用这些数据首先重建一个coarse mesh。然后将其fit到一个FLAME model上获得更精确的geometry信息，进而获得更加精确的UV parameterization。
   3. 作者认为polarizers会对不同wavelength的light产生不同的attenuation，因此使用一个colorchecker board去colibrate color（affine transformation）。
   4. 此外作者认为flashlight不完全是一个point light，因为hardware原因其在某些方向会被遮挡，导致有些surface point接收的光不能完全用一个point light来计算（实际上没有接收到所有的光，只接收到一些特定方向的光），所以作者使用一个per-pixel的light attenuation map来建模（与render结果相乘来近似，因为render结果是用point light获得的，而实际场景非point light，所以要在render结果基础上attenuate）。为什么可以这样来model：因为对于image plane，每个pixel对应的surface point，其跟光源的相对位置是固定的（除去distance因素），所以每次拍摄的image，其同一个pixel上的surface point都接收了同样的光，乘以attenuation只是将光的比例缩小，来建模那些实际point light没有射到点上的光线。
   5. video中每10-frame抽取a frame（基于sharpness，其由laplacian衡量）。由于photograph时的light比video亮，因此要把iso和光圈调小，使得它们的亮度相似。
2. geometry reconstruction：用Agisoft Metashape重建。
3. BRDF：考虑了SSS
4. optimization：
   1. train两个部分都采用coarse-to-fine的方式，每次从512*512 resolution先train，然后resize继续train直到4096。所以train的内容全部在texture space，即texture map的内容是trainable 参数。首先train albedo部分，收敛后固定，然后train specular部分。
   2. 作者考虑到某些拍摄的image中某些pixel对应的部分刚好是在grazing angle下得到的，这样会影响image的quality，因此这些pixel的train weight应该被降低，即view和normal夹角越大的pixel权重越小，据此可以获得一张image，其每个pixel代表weight。此外，作者还考虑拍摄的distance问题，如果对于一个pixel，其对应的mipmap的level比较大（resolution比较低），代表其距离较远，实际的detail较少，那么其不应该被用于优化。实际过程中，作者只取了level 0来算weight map。

### limitation
1. 虽然只用一个手机拍摄条件比lightstage要好，但是要保证environment illumination近乎全黑实际上条件较为苛刻。此外，还需要保证拍摄的地点不能有一些反光强的物体，比如不能有玻璃、镜子等，否则没办法保证每个pixel的color都是来自于surface point。

---

## Deferred neural lighting: free-viewpoint relighting from unstructured photographs

### innovation

#### problems in previous work
1. model-based solutions没法exactly recover each component（material、geometry、lighting）。
2. image-based solutions（特指Debevec的方法）需要dense and accurate samplings，难以获得。

#### improvements
1. 针对1的问题，作者选择使用image-based方法去做。针对2的问题，作者用了另一种image-based方法，不需要dense sampings。

### introduction
1. 第一段：介绍背景。简述model-based approach是怎么做的，指出其问题。简述image-based approach怎么做，指出其问题。
2. 第二段：首先一句话介绍自己的方法优越性。然后按first、second、finally介绍自己方法并指出radiance cues的重要性。
3. 第三段：说明如果geometry太差或者light transport effects过于complex，会导致neural textures需要太多channel或者neural renderer需要特别多的parameter来保证学习到这种information，然后引出自己的方法；指出自己做的实验证明了自己的方法有效性；进而引出自己的augmentation方法。
4. 第四段（contributions）：
   1. a novel system（能够整体上实现什么）
   2. a neural renderer（能够解决不同的lighting conditions）
   3. a novel acquisition（easy to do）
   4. an augmentation method（能够以不同的light做relighting）

### related work
1. model-based solutions：分为shape modeling、appearance modeling和joint modeling of shape and appearance。
   1. shape modeling没有model view dependent appearance。
   2. appearance modeling只能基于accurate geometry。
   3. joint modeling的精确度局限于输入数据的accuracy和当前材质下的model是否适用。
2. image-based solutions：分为image-based rendering和image-based relighting。

### methodology
1. 利用一个手机和一个相机作为acquisition setup，手机的flashlight作为point light。在获得proxy geometry时在natural light下用相机拍摄，然后用COLMAP重建mesh。然后在做relighting时，将手机camera和相机camera register上去，以手机的pose作为point light的位置，以相机拍摄的image来train。
2. neural textures有30个channel，material basis有5个（一个Lambertian，4个不同的roughness）。首先在某个pose下的view做一个rasterize，然后对每个pixel取texture，获得一张（H\*W\*30）的内容。（neural textures还过一个net获得mask）
3. 然后用path tracer，对不同的material和已知的geometry、point light做rendering（当前view）得到5张light map。
4. neural texture一共30-channel，分为5组，每组6 channels（实际为两张rgb image）。6个channel中每3个channel与light map相乘（element-wise），因此每组channel能获得两张image。将相乘后的一共10张image输入neural renderer获得最终结果。
5. 解决问题
   1. 为了解决GPU memory的问题，作者在view sphere上uniformly分布13个point（每个point对应一个net），然后point相连获得triangle。对于落在某个triangle内的view，其内容需经过这个triangle的3个vertices对应的net，得到三个不同的结果，然后将这三个结果以重心方式算weighted sum。
   2. 作者是用point light做的train，为了generalize to novel lighting，作者将light做了一个augmentation，使model可以用于environment map。  
6. 作者对拍摄到的用于train的image做了一个gamma correction（2.2）使得pixel value radiometrically linear。（相机在把拍摄到的内容存成image file时就做了一个gamma=1/2.2的correction，使image的成像更接近于人眼，因此做一个gamma=2.2的correction能够变回去）。
7. 作者对training gt和predicted image首先做了一个log，使它们在log域算loss，这保证training gt的dynamic range也能够被学习到。 

### limitation
1. 在设计网络时，没有explicitly考虑view direction。作者认为一个renderer没办法model所有view的结果，因此只是将所有的view分为13个partition，然后对每个partition train一个renderer。（或许是作者试过view direction的model，但是效果不好）。

---

## Rapid Acquisition of Specular and Diffuse Normal Maps from Polarized Spherical Gradient Illumination


### normal derivation
1. 对于位于light stage中心的human or object来说，从light stage各个方向射向其时，若某个方向为$\omega=(\omega_{x}), \omega_{y}, \omega_{z}$，那么从这个方向射出的光的intensity调整为$\omega_x$或$\omega_y$或$\omega_z$，至于调整为哪个，视其为4个pattern中的哪一个，若为$P_x$则调整为$\omega_x$，依次类推。
2. 整个light stage所有光源的最大亮度若为c，则pattern=c时代表将所有light的强度调整为c；若pattern=X，代表将每个光源的强度调整为$c\omega_x$（其中$\omega=(\omega_{x}, \omega_{y}, \omega_{z}) \& ||\omega||_2=1$）;pattern=Y或Z时类似。
3. diffuse normal推导
![diffuse](/images/diffuse_normal.png.JPG)

由于在公式推导时入射光强度$P_i(\omega)$定义在[-1, 1]上，即入射的light intensity定义在[-1, 1]，因此获得的reflectance（$L_x(\vec{v})$、$L_y(\vec{v})$、$L_z(\vec{v})$）也分布在[-1, 1]，这才能使得上述推导获得的normal取值在[-1, 1]之间，代表真正的坐标。由于我们实际的光照intensity位于[0, 1]之间，无法满足公式推导时的[-1, 1]要求，因此我们需要将得到的$L_i$映射回[-1, 1]。我们实际光照的intensity$P_i'$满足$$P_i' =\frac{1}{2}(P_i+P_c), P_c=1$，那么用这个实际的$P_i'$作为intensity得到的reflectance为$L_i'$，用推导时位于[-1, 1]之间的$P_i$得到的reflectance为$L_i$，用实际的满光照$L_c$得到的reflectance为$L_c$，则根据线性相加原则，$L_i'=\frac{1}{2}(L_i+L_c)$，为了将[0, 1]之间的$L_i'$映射回[-1, 1]，因此做反变换得到$L_i=2L_i'-L_c$。即我们要将在gradient illumination下得到的image $L_i'$的pixel value先乘上2，然后再减去在full illumination下得到的image $L_c$，即可得到位于[-1, 1]之间的$L_i$。根据上面的推导，将得到的$(L_x, L_y, L_z)$做normalization即可得到normal坐标，其位于[-1, 1]。为了做visualization，可以将其归一化到[0, 1]。文中的Figure 2就做了这个过程。

4. specular normal推导

---

## Learning to Reconstruct Shape and Spatially-Varying Reflectance from a Single Image

### class
image-to-image

### setting
1. light: 
   1. point light collocated with the camera
   2. environment light(SH)

### brief summary
xxx trains an image-to-image pipeline which first gets the coarse results from three bounces, then refines it by cascade structure.. 

## De-rendering 3D Objects in the Wild

### class
image-to-image
unsupervised

### innovation
1. 第一次以unsupervised方法在in-the-wild数据上做inverse rendering。

### brief summary
First estimate the coarse geometry, material, light, then use the coarse information as the pseudo supervision to bootstrap the decomposition.

### thinking process
1. inverse rendering是一个ambiguous的问题，light、material和geometry的不同组合都能得到相同的结果，因此想要decompose必须要一些hints去引导学习。直接使用supervised的当然更好，但是要在in-the-wild上做需要特别的设计。
2. 作者首先进行一些假设简化rendering过程，然后预估coarse的各个components，然后以它们作为一些监督去引导decompose，但是由于之前的假设以及简化，渲染的结果可能不够好，因此将足够的flexibility赋予网络克服。

### methodology
1. 通过off-the-shell方法获得depth，然后由depth获得normal。
2. 简化rendering过程为phong-model（每张image share同一个scalar ambient light intensity、同一个scalar specularity intensity、同一个scalar shiness $\alpha$，建模一个directional light优化其light intensity和direction），light被建模为ambient light和directional light。
3. 这样设计GAN的原因：在PBR中，即使已知light的所有信息，还是有可能在normal（geometry）和material之间产生ambiguity（$f(\omega_i, \omega_o) <\vec{n} \cdot l>$），$f$和$cos\theta$之间不同的组合都可以产生相同的结果。直接对图像加image loss无法克服这种ambiguity，导致material和geometry无法较好地decomposition，一种比较明显地反映decomposition不好的现象就是当改变light时，渲染出来的图像有很多artifacts。作者发现改变light方向是导致这种artifacts的最主要因素，因此他从light direction入手。以estimated light direction和randomly sampled light direction分别做渲染，用GAN使得任意方向的渲染更像是resonable渲染结果。这就使得material和geometry能够估计地更加准确，因为任意方向的light都能生成好的结果的唯一可能就是它们估计地准确。作者考虑到用自己定义的rendering pipeline可能本来就会引入artifacts，所以他不用gt image来作为positive样本，防止discriminator将pipeline本身的不足作为判别是否为好的样本的依据。

---

## Cosine Lobe Based Relighting from Gradient Illumination Photographs

### usage
1. 以color gradient illumination获得imape per-pixel phong-model parameters、diffuse和specular normal、shadow的方法。
2. camera和LED light由于color primaries不同可能会产生LED发出的颜色被camera接收时产生不同颜色的后果，因此需要对两个sources进行color alignment。（LED根据自己的color primaries（RGB三通道各有一个value）去生成颜色，即在RGB三个通道分别有一个value，但是由于camera的primaries不同，camera接收到三个value时，是根据自己的primaries去理解这个value的。）要记住这个细节。

### innovation
1. 将spherical gradient illumination的四次imaging通过color gradient illumination减到两次。
2. 能够较好地explicitly fit出per-pixel phong exponent，而之前的方法要么需要manually select exponent，要么需要更多的光照条件（这里只需要两种）来估计per-pixel exponent。

### methodology
1. spherical gradient illumination是用4种gradient illumination（全白光，三通道值一样）去拍摄照片来计算normal等，但是这篇文章将gradient illumination的强度放入到rgb的不同通道中，因此只需要用一个spherical color gradient illumination和full illumination照射两次，就能够通过ratio获得spherical gradient中需要的三张image。
2. 然后通过Phong model的cosine lobe将每个pixel的的BRDF fit出来，最终可以得到这个pixel对应的lobe中心direction、shiness以及反射系数k。因此只要有了光照就可以逐pixel进行基于phong model的relighting。
3. 由于已经得到了每个pixel的lobe direction，那么可以根据view direction和lobe direction（perfect reflection direction）的half vector获得specular normal，并直接以lobe direction作为diffuse normal。
4. 得到normal后就可以利用类似poisson重建的方法获得coarse geometry，然后以这个coarse geometry来model self-occlution从而model shadow。

---

## Deep reflectance fields: high-quality facial reflectance field inference from color gradient illumination

### usage
1. 为了克服OLAT拍摄时被摄者的移动，每拍摄11帧时使灯光全亮拍摄一张“tracking frame”，最后用所有的tracking frame做个optical flow。然后所有帧的flow都可以通过时间进行插值获得。算法引用*Jump: Virtual Reality Video*。
2. 提供生成random light direction下的OLAT image的方式。
3. OLAT拍摄dynamic scenes的解决方案。
4. 

### problems in pervious work
1. OLAT配合envmap生成relighting image的方式不用explicitly model material和geometry就能够做。但是无法capture time-varying dynamic scenes；硬件复杂（高速相机、同步设备等）；需要做optical flow alignment应对人体微小变化。
2. 为了capture dynamic scenes，关键就是每次只需要不多的images去做relighting。在这样的setting下，有些方法选择性地只对portrait的某一部分做relighting（skin、clothes、glasses， etc.）；也有些只在synthetic数据集上有效果。

### innovation
1. 在inference阶段，即对某个新拍摄的人做relighting时，只需要坐下来拍摄两张color gradient images即可，拍摄过程非常简单，避免了做optical flow，以及对被摄者静止的限制，因此也就可以用于拍摄dynamic的scenes。
2. 可以生成任意light direction的OLAT image，这种dense结果能够在利用envmap时效果更好。
3. 相对于cosine lobe来说，由于cosine lobe需要explicitly建模normal等，所以为了准确性，它们需要对light和camera的color primaries做一个alignment，但是在这里不需要explicitly得到这些东西，所以相当于这种alignment都由网络学习。

### thinking process
1. spherical color gradient images包含有丰富的信息，包括reflectance、shadowing等，因此与其像之前explicitly去获得各种material，不如直接用网络去预测OLAT images。能够说得通的地方就是spherical color gradient images含有丰富的信息，可以用DP decodes直接获得OLAT images。
2. task-specific VGG loss很具有启发性。

### brief summary
Given the two gradient images and light direction, xxx predicts the OLAT image relit by light from that direction. Then, OLAT images from dense light can be easily obtained and used with environment map to get the relit result.

### methodology
1. 在inference阶段可以只拍摄两张spherical color gradient images，但是在training阶段为了获得数据，肯定不可能这样复杂地去获得training数据。因此在拍摄training image时还是用常规的静止方式，并每11帧拍摄一张全亮的tracking frame用来算optical flow。
2. 每次输入网络的数据为两张gradient images和light direction的堆叠，因此为HxWx9。经过Unet来预测在这个输入的light direction下的OLAT结果。
3. loss：
   1. pretrained VGG loss
   2. specific VGG loss：作者认为pretrained VGG是在natural images上train的，无法捕捉当前task下的high frequency细节（specularity等），而specularity heavily depend on入射光方向，因此其想法是让整个network变得direction-aware。作者以VGG的network architecture预训练了一个网络，输入为gt image patches，输出为gt image拍摄时的light direction，即做了一个regression。可以理解为这个训练好的网络能够从输入image的specularity预测出light direction，而没有specularity的image难以预测出这个方向，那么用这个网络回归的方向去监督OLAT image的生成能够促使生成的image带有正确的specularity，这样才能保证回归的direction准确。
   3. sliding window pooling loss：作者认为即使在对training image进行optical flow校正后，还会存在noise，这种noise会导致网络无法较好地学习。因此首先用这个loss将gt image的optical flow校准到最佳。

---

## Deep reflectance fields: high-quality facial reflectance field inference from color gradient illumination

### setting
1. light：ambient light and directional point flash light（co-located with camera，so flash visibilty=1）
   1. 每个light都被建模为色温（代表颜色）*强度（可以嵌入visibility）
   2. 所有pixel的ambient色温和flash色温都被认为是一样的
2. material assumption：lambertian

### usage
1. 对pretrained object segmentation network在portrait上进行fine-tune。然后进一步计算visual hull estimation  
2. 用Metashape也可以做sfm。
3. 算mask loss既可以用cross entropy loss，也可以用Dice function。
4. PRNet（Joint 3D Face Reconstruction and Dense Alignment with Position Map Regression Network）可以将face map到texture map（predefined space）上

### problems in pervious work
1. capture device复杂

### innovation
1. new rendering equation
2. handheld smartphone as capture device which is easy to perform

### thinking process
1. 简化rendering equation，使其能够得到该有的intermediate components以model复杂的rendering过程。
2. 加各种loss促进decomposition。

### brief summary
xxx first uses off-the-shell sfm software to get point cloud and descriptors for each point, and then passes the rasterized descriptors to the neural rendering network
, whose outputs are fusing by their simplified rendering equation.

### methodology
rendering equation：
$$
\mathcal{I}=A \cdot C^{\mathrm{room}} \cdot S+\mathrm{F} \cdot A \frac{C^{\text {flash }}}{d^2}\left\langle N,-\omega_o\right\rangle
$$

1. 首先用Metashape得到point cloud和per-point descriptors。
2. 然后用pretrained ${\rm U}^2$ Net（object segmentation network）在portrait上进行fine tune，进一步用visual hull去优化net，使其能够得到准确的mask作为gt。
3. 然后将feature descriptors根据z-buffer rasterize到每张image上，把这些rasterized images过一个neural rendering net，获得albedo、normals、shadow map以及mask。（每张image都被加工为pyramid算loss）。
4. loss
   1. mask loss：同gt mask算loss（Dice function or cross-entropy loss）。
   2. img-to-img loss：在relighting结果上加VGG以及L1 loss
   3. TV loss on shadow map：在其rendering equation中，有ambient light部分以及flash light部分，两个部分中都有albedo，因此在优化时，albedo默认不会含有high-frequency details（共用的部分不能过于high-frequency，否则会导致两个part的结果在训练过程中不够稳定，只有当其比较low-frequency时，两个part的component才会比较稳定），这会导致在ambient部分，本该属于albedo的high frequency内容被baked into shadow map，因此给shadow map加一个TV，使其比较low-frequency，那么high-frequency内容只能被嵌入albedo。
   4. normal loss：从PRNet可以估计出gt normal。
   5. albedo symmetry loss：将估计出来的albedo通过PRNet映射到texture space。gt的albedo texture map来源于对每张training image都进行mapping，然后取所有image的median得到一张类albedo texture map（$T_F$），然后将其右半part进行flip（与左半part同shape），并与左半part求average，得到一张只含左半part的texture map($T_A$)，对其进行flip得到整张albedo map，以其作为监督。这利用了人脸的symmetry prior。
   6. albedo color matching loss：对$T_F$与估计的albedo算一个L1 loss，用来使得albedo的color相近。
5. 可优化的为：ambient light色温、albedo、shadow map、flash色温、feature descriptors。

## NeRFactor: Neural Factorization of Shape and Reflectance Under an Unknown Illumination

### setting
1. light：unknown，即没有direct supervision。最后建模为一张16*32的envmap image。作者不用SH或SG的原因是，SH和SG都是low-frequency的，可能无法解释一些hard shadow，但是envmap可以。
2. material中的specular部分是没有颜色的（achromatic）

### usage
1. 控制网络学习smoothness，就是在$f(x)$和$f(x + \epsilon)$加一个loss。
2. Nerf的normal是通过对density求梯度算得，Nerf的visibility是通过算transmittance获得，而某条光线的intersection surface point是通过将volumetric rendering中的color替换成depth t来获得的。
3. MERL dataset是真实世界的材质数据集。
4. 由于albedo的亮度是任意的，因此在可视化时，一种可靠的做法是，取一个scale值，使得估计的albedo和gt albedo之间的MSE最小。
5. 对isotropic BRDF的光源入射角和出射角的新的表示方法（从4自由度（$\theta_i$, $\phi_i$）变为3自由度($\theta_h$, $\theta_d$, $\phi_d$)），参考*A Data-Driven Reflectance Model*

### key contribution
提供了在Nerf帮助下不需要supervision做inverse rendering的方法。

### thinking process
1. 首先，作者想做一个relighting，但是没有现存的数据集支持做relighting。因此，其打算从Nerf入手去做。这样就可以从Nerf获得normal和visibility。
2. 由于decomposition是一个非常ambiguous的问题，所以作者打算先pretrain normal和visibility，以利于后续albedo和light的training。但是发现直接给normal和visibility加l1 loss会导致优化出来的结果非常noisy，因此加了一个smooth loss。
3. 然后由于albedo没有直接的supervision，只能加一个smooth loss试着优化。
4. 对于BRDF，作者认为直接用microfacet，先验限制太强了，可能会影响真实世界的diverse材质的获得，因此决定用real-world material去得到一些材质信息。自然而然就想到用real-dataset去pretrain获得一个latent code的decoder，其可以将latent转换为真实世界的BRDF。然后在自己的数据集上train latent code，得到最终的specular的BRDF。在specular部分，作者认为反射的颜色都由albedo决定，因此specular是无色的。
5. 最后对于light，作者在没有监督的情况下估计了一张envmap image。

### brief summary
Based on Nerf， xxx gets the pseudo supervision for normal and visibility to bootstrap the decomposition。

### methodology
1. 首先train一个Nerf。
2. 然后算Nerf的intersection、visibility和normal，用它们来做decomposition的coarse supervision。
3. 然后pretrain一个normal的MLP和一个visibility的MLP（都以intersection作为输入），用Nerf算出来的value做监督。这样是为了后续的decomposition有一个好的initialization。优化的loss都是一个l1 loss和一个smooth loss。有了一个好的visibility，才能够防止shadow被albedo和light所baked in。(在visibility中，smooth loss只对x加而不对$\omega$加，是因为)
4. 然后是优化albedo，albedo由于没有直接的监督，只能在albedo上面加一个smoothness的priors监督，这个loss配合visibility能够更好地把shadow从albedo里面分离开来（如果没有visibility，当appearance为黑白相间时，无法分辨到底是本来的颜色就是黑白色，还是白色的surface表面有了shadow）。
5. 为了得到specular BRDF，其在real-world dataset上pretrain一个latent code的decoder，用于将latent code解码得到BRDF。然后在自己的数据集上学一个encoder，用于将每个surface position编码成latent code，以得到BRDF。在算specular BRDF时，作者认为其是没有颜色的，颜色都来源于albedo。因此在pretrain时，color information都被解除了（grayscale），预测时也保证了BRDF的三通道都是一样的值。
6. 最后估计一张envmap作为光源（没有监督）。