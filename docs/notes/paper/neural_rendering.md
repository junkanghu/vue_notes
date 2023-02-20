# Neural rendering
[[toc]]

## IDR：Multiview Neural Surface Reconstruction with Implicit Lighting and Material

### innovation
1. 之前的工作没考虑光照和surface material对appearance的影响，也没有考虑优化camera locations和orientations。此工作可以同时进行。
2. 以一个continuous implicit neural network来建模BRDF、lighting、geometry（造成shadow-secondary lighting）综合作用下产生的surface appearance，即rgb。

### methodology
1. ray-tracing到surface point的depth。
2. 对surface point进行reparameterization。
3. 计算rgb

### details
1. IGR（Implicit Geometry Regularization），即eikon loss，能够使得surface更加smooth和realistic。
2. 这里将某个camera location c、camera view direction v下通过sdf $S_{\Theta}$看到的surface point的depth t，作为上面这三个参数的函数，即$t(c,v,\Theta)$。而c、v、$\Theta$都是continuous的，因此t在整个定义域上是continuous且differentiable的。因此对point x（$x=c+tv$）算它们三个的梯度时，能传到$\Theta$的梯度只能经由t传到。
3. 对c、v、$\Theta$的优化可以这样来理解：随着优化进行，当前pixel产生的ray的出发点（camera center）和方向都会逼近真实的camera pose，在不断的优化下，camera pose逐渐接近真实或者说可以认为已经优化完成，此时需要更注意sdf的优化，通过对x（或者说t）在当前view direction方向上进行移动，可以讲surface point在view上进行移动，以让其更接近真实的shape。
4. 对x进行reparameterization后，我们可以发现对某个固定的c和v（即假设不优化c和v，或c和v的优化已经收敛时），在固定的c和v上的更新后的x的下个参数，只会在view direction上变动。

---


## NeuS: Learning Neural Implicit Surfaces by Volume Rendering for Multi-view Reconstruction

### advantages and limitations in previous works
* IDR:
  1. fail to reconstruct objects with complex structures that causes abrupt depth changes: The cause of this limitation is that the surface rendering method used in IDR only considers a single surface intersection point for each ray. Consequently, the gradient only exists at this single point, which is too local for effective back propagation and would get optimization stuck in a poor local minimum when there are abrupt changes of depth on images
  ---
  illustration of surface rendering and volume rendering:
  ![rendering_methods](/images/rendering_methods.jpg)

  (with the radical depth change caused by the hole, the neural network would incorrectly predict the points near the front surface to be blue)

  ---
  examples of idr limitation near the edges with abrupt depth changes: 
  ![idr_abrupt_changes](/images/idr_limitation.jpg)

  ---
  2. object masks are needed as supervision for converging to a valid surface

---

* traditional multi-view 3D reconstruction methods(surface and volumetric methods)
  1. surface methods(point-(sparse) and surface-based(dense) methods)
     * pipeline: sparse reconstruction -> dense reconstruction
     * limitations: heavily relies on the quality of correspondence matching. and the difficulties in
     matching correspondence for objects without rich textures often lead to severe artifacts and missing parts in the reconstruction results
  2. volumetric methods
     * pipeline: estimating occupancy and color in a voxel grid from multi-view images and evaluating the color consistency of each voxel

  limitations for traditional methods: Due to limited achievable voxel resolution, these methods cannot achieve high accuracy

---

* neural implicit representation
  * surface rendering-based methods
    * assume that the color of ray only relies on the color of an intersection of the ray with the scene geometry, which makes the gradient only backpropagated to a local region near the intersection
    * limitations: struggle with reconstructing complex objects with severe self-occlusions and sudden depth changes
  * volume rendering-based methods
    * render an image by α-compositing colors of the sampled points along each ray
    * advantages: can handle abrupt depth changes, because it considers multiple points along the ray and so all the sample points, either near the surface or on the far surface, produce gradient signals for back propagation.
    * limitations: since it is intended for novel view synthesis rather than surface reconstruction, NeRF only learns a volume density field, from which it is difficult to extract a high-quality surface

---
### innovation

---
### limitation

---
### some conceptions
* gradient$\nabla$
  * assuming $f(x,y,z)$ has a first-order continuous partial derivative in area $G$, for every $P_0(x_0,y_0,z_0)\in G$, there exist a vertor
  <br>
  $$
  f_x(x_0,y_0,z_0)\vec{i}+f_y(x_0,y_0,z_0)\vec{j}+f_z(x_0,y_0,z_0)\vec{k}
  $$
  which is the gradient of $f(x,y,z)$ at $P_0(x_0,y_0,z_0)$, it is denoted as **grad** $f(x_0,y_0,z_0)$ or $\nabla f(x_0,y_0,z_0)$
  <br>
  so
  **grad**$f(x_0,y_0,z_0)$ = $\nabla f(x_0,y_0,z_0)$
  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;=$f_x(x_0,y_0,z_0)\vec{i}+f_y(x_0,y_0,z_0)\vec{j}+f_z(x_0,y_0,z_0)\vec{k}$
  <br>
  therefore:
  $\nabla f$ is such a vector that its direction is the direction that f changes the fastest.
  <br>
  if we introduce a surface $f(x,y,z)=c$ as a level-set, we can know that direction of the gradient $\nabla f(x_0,y_0,z_0)$ at point $(x_0,y_0,z_0)$ of $f(x,y,z)$ is the direction of the normal of $f(x,y,z)=c$ at this point.

* the Eikonal term loss:
  When optimizing the loss using the loss functions, two questions emerge:
  1. Why the parameters$\theta$ of the MLP found by the optimization lead MLP to be a signed distance function. Usually, adding a quadratic penalty with a finite weight is not guaranteed to provide feasible critical solutions, i.e., solutions that satisfy the desired constraint itself.
  2. Even if the critical solution found is a signed distance function, why should it be a plausible one? There is an infinite number if signed distance functions vanishing on arbitrary discrete sets of points $\xi$ with arbitrary normal directions.

  It is proved that this loss function used in gradient descent is effective for getting a smooth and plausible one.

* Why perform upsamping using different s in the code?
![s](/images/s_prin.jpg)
* 

---
### tricks
1. cosine decay schedule--learning rate:
   * definination: 
      * *self.iter_step*: current step
      * *self.warm_up_end*: warmming-up iter
      * *self.end_iter*: the endding iter
      * *alpha*: the final lr
   * usage
      * for **$iter < warm\_up\_end$**, lr increases linearly from 0 to *self.learning_rate*
      * for **$warm\_up\_end < iter < end\_iter $**, lr decreases from *self.learning_rate* to *alpha* following the cosine decay schedule

   ``` python
   if self.iter_step < self.warm_up_end:
            learning_factor = self.iter_step / self.warm_up_end
        else:
            alpha = self.learning_rate_alpha
            progress = (self.iter_step - self.warm_up_end) / (self.end_iter - self.warm_up_end)
            learning_factor = (np.cos(np.pi * progress) + 1.0) * 0.5 * (1 - alpha) + alpha

        for g in self.optimizer.param_groups:
            g['lr'] = self.learning_rate * learning_factor
   ```
2. about number processing
   * number should deviate from its theoretical one:
      ``` python
      z_vals_outside = torch.linspace(1e-3, 1.0 - 1.0 / (self.n_outside + 1.0), self.n_outside)
      ```
      which takes numbers between 1e-3 and 1.0-... rather than 0 and 1
   ---
   * when a number serves as a denominator, it should add a small number(usually **1e-5**) to avoid cases like divided by 0 or numbers almost approximates 0.

---
### problems
1. Note that the standard deviation of $\phi_s(x)$ is given by $\frac{1}{s}$, which is also a trainable parameter, that is, $\frac{1}{s}$ approaches to zero as the network training converges.
   solution: As the training goes, the ideal situation is that the weight function is very steek which means the standard deviation is very small.
2. figure 3: visible and invisible surface
3. why this way can solve the problems caused by abrupt depth change and occlusion and why nerf can handle abrupt depth problems
4. why $\alpha$ takes the *max* operation? According to the feature of $\rho(t)$, $\alpha$ naturally obeys this rule.
5. mask loss
6. renderer.py line 230: dirs are unit vectors, but gradients may be not though the gradient loss forces them to be like unit vectores
7. cos anneal ratio at renderer.py line 230

---

### mathematical derivation
* $$
  \begin{aligned}
  \omega(t) &= \displaystyle\frac{\phi_s(f(p(t)))}{\int_{-\infty}^{+\infty}\phi_s(f(p(u))){\rm d}u}\\
  &= \displaystyle\frac{\phi_s(f(p(t)))}{\int_{-\infty}^{+\infty}\phi_s(-|{\rm cos}\theta|\cdot(u-t^*)){\rm d}u}\\
  &= \displaystyle\frac{\phi_s(f(p(t)))}{-|{\rm cos}\theta|^{-1}\int_{-\infty}^{+\infty}\phi_s(-|{\rm cos}\theta|\cdot(u-t^*)){\rm d}(-|{\rm cos}\theta|\cdot(u-t^*))}\\
  &= \displaystyle\frac{\phi_s(f(p(t)))}{-|{\rm cos}\theta|\cdot\int_{-\infty}^{+\infty}{\rm d}\Phi(-|{\rm cos}\theta|\cdot(u-t^*))}\\
  &= \displaystyle\frac{\phi_s(f(p(t)))}{-|{\rm cos}\theta|\cdot\int_{+\infty}^{-\infty}{\rm d}\Phi(v)}\\
  &= \displaystyle\frac{\phi_s(f(p(t)))}{-|{\rm cos}\theta|\cdot(-1)\cdot1}\\
  &= |{\rm cos}\theta|\phi_s(f(p(t)))
  \end{aligned}
  $$

* consider this naive solution
  $$
  \omega(t) = \displaystyle\frac{\phi_s(f(p(t)))}{\int_{-\infty}^{+\infty}\phi_s(f(p(u))){\rm d}u}
  $$
  the reason why this $\omega (t)$ is not occusion-aware is that when this one is disentangled with $T(t)$ and $\rho (t)$, $\rho (t)$ may be negtive in certain segment of the ray, thus the $T(t) = e^{-\int_0^{t}\rho(u){\rm d}u}$ will increase and at the second surface intersection, $T(t)$ becomes equal to the first intersection. And the $\rho(t)$s at these two intersections are equal, thus the two $\omega(t)$s equal. After constrain the $\rho(t)$ as ${\rm max}(\cdots, 0)$, $T(t)$ won't increase anymore but keep decreasing, so although $\rho(t)$s at these two intersections are equal, their $\omega(t)$s don't equal anymore.

---

## NeRF in the Wild: Neural Radiance Fields for Unconstrained Photo Collections

### innovation
 NeRF短板：NeRF认为不同的image中，从同一个方向观察同一个点会得到相同的rgb值(因为NeRF适用的场景都在一些室内的短时间场景，其间光照条件什么的比较恒定)。但是这不符合outdoor photography呈现出来的效果（1、室外的环境时刻在变，即光照、空气等时刻在变，这会导致射入camera的radiance时刻在变。且由于radiance在变，相机内部也会动态调整exposure、white balance、tone-mapping等，这使得该效应被加剧。 2、现有的一些数据集都是在无人的地方拍摄的，镜头中几乎不会有正在动的object（如transient occluders），但是室外环境中拍摄的image可能包括行人，他们的出现会改变拍摄的一组图像中不同图像对同一方向同一个点的观察）。因此当NeRF用于移动的物体或多样的光照时，其效果大打折扣。这使得NeRF无法用于大规模的野外照片集（光照不同：照片之间的跨度往往以小时甚至年来算；包含行人或车子）。

 改进：
 1. 利用apperance code来建模不同的光照环境，以解决NeRF需要恒定光照的限制。
 2. 利用transient head和uncertainty来建模transient occluders，建模后可以直接移除transient分量以获得static分量。

### methodology
![nerf-w](/images/nerf-w.png)

1. 最终输出的rgb分为两个分量：static head、transient head。
2. static：在NeRF输出$\sigma$和$z(t)$（feature vector）后，加入一个latent apperance code来建模每张图片单独的光照条件（每张照片都有一个appearance code，trainable，意味着只有训练数据才会有code。在test时，可对不同的code进行插值来获得新的code，或者直接随机一个code，实验证明这只会改变光照条件，不会改变geometry）。
3. transient：如上图一样在每个sample点处再生成一个transient的量，其volume rendering同static分量相同。最终的rgb值由static分量和transient分量线性叠加。
4. uncertainty：$\beta$是由MLP产生的。本方法对uncertainty的建模认为，每个pixel的颜色值遵循正态分布，每个pixel在当前训练阶段预测的颜色值是正态分布的均值，然后这个pixel的variance值就是$\beta^2$。variance值越大代表当前pixel的值不太稳定，其是不可靠的pixel，在计算loss时应该被排除在外。一条ray上的每个sample点都有一个$\beta_i(t)$，然后对一条ray进行alpha compositing才能获得这条ray的variance $\beta_i$。
5. loss
![total](/images/total_loss.png)
![loss](/images/loss.png)
   1. 本文采用NeRF的coarse-to-fine策略，total loss一共有两部分loss，一个是coarse，一个是fine。
   2. coarse部分只采用appearance code（static和transient都有），没采用uncertainty。
   3. fine部分的loss中，第一项代表着variance$\beta$越大，这个pixel越不可靠，因此其权重应该越小，对loss的影响越小；第二项是对第一项的惩罚loss，用于减小$\beta$值，防止所有pixel的$\beta$值都很大，使网络认为所有pixel都不可靠而学不到东西。第三项是对transient density的惩罚，防止transient density过大，抹杀了static density的作用（算法本身想获得static scene）。

### thinking
1. 为什么算transmittance时static和transient的density可以相加？
如果只有static，那么空间中的object的位置是固定的，每个location的density也是固定的。而有了transient后，其在原来的static基础上相当于在scene中的某个location放了新的object，因此除了新object所在的位置，其他的density保持与static时一样，而新object位置的density由于object的存在而变大了。因此在算transmittance时，要把static和transient各自的density相加，理想的情况是static density就是代表没有transient object时的density，而transient density除了有新object的地方，其他地方的density几乎为0（没有在这些地方加入新的particle），而有新object地方的density在static density中几乎为0，加上了transient density后总量变大了。这就造成scene中，如果有transient遮挡了static部分，由于新obejct处的density很大，计算transmittance时，新object后面的sample point的transmittance会非常小，即只有transient处的sample point对ray rgb有贡献，而后面的static object没有贡献，这就可以解释新object遮挡了static scene中的内容。
2. 为什么uncertainty能够work？
文中说uncertainty的作用是减少含有transient的pixel对于loss的贡献值，以使其梯度减小，这使得不含有transient的表示static scene的pixel的贡献较大。首先因为transient是image-dependent的，即每张image张除了static scene的内容是不变的（只是改变了view point），transient的量有可能在每张image中都不相同，因此为了model这种diversity，给每张image一个transient code（在static part中也有一个code，其是appearance code）以model当前image中的transient。这个transient code使得transient Nerf能够随着其变化（对于当前image，相当于对当前image中的transient object建了一个Nerf；对另一张image，对其transient object建了另一个Nerf。这两个Nerf并不是通过建立两组MLPs来实现，而是通过1组MLP配合不同的code实现，输入不同的code代表不同组MLP之间的切换）。

<br />

transient ray上的每个sample point的$\beta_t$的大小应该是与transient density一致的，即transient density越大的点其$\beta$越大。因此一条ray上属于static部分的point的uncertainty应该趋向于0（因为其是static的，方差不大，即color几乎不会变，但是transient由于occluder会变，因此方差较大），而属于transient部分的point的uncertainty较大，因此在alpha compositing时，属于transient部分的point的贡献较大。这个pixel的uncertainty应该就是为了explicitly指示出哪些pixel含有transient分量，由于我们的最终目的是获得static部分的density和color，含有transient分量的pixel，其对于static部分的density和color学习几乎起不到什么作用，因为它看不到static部分，因此这些pixel从理想上来说应该不用作算loss，用这个uncertainty可以将这些pixel的相对loss weight调低，从而降低对网络参数的控制能力。这个transient head不仅能够将transient和static分离开，在将它们分离开来后，还能够控制loss的weight，使得static部分优化得更好。

---

## HDR-Plenoxels: Self-Calibrating High Dynamic Range Radiance Fields

### innovation
1. 前人的方法都是通过固定相机并调整曝光度以获得multi-exposure images，然后根据这些multi-exposure LDR images去合成HDR images。这种方法局限于view point，不能改变相机位置。本文提出对HDR radiance进行重建，可以在任何视点获得LDR images。
2. 本文可以通过控制white balance、exposure来获得不同效果的image。


### methodology
前提：不用mlp；不用successive的空间表达，而是用voxel。
方法：
1. 整个bounded space在训练初始阶段被划分成均匀的voxels。每个voxel的八个顶点分别存有28维的参数，其中1维代表顶点的volume density值，27维中的3个9维参数分别对应rgb中每个通道的SH coefficients。在voxel中的任一点的上述28维参数，可以通过对8个顶点的值进行trilinear插值获得。插值完后可以得到该点的28维参数。然后可以根据SH basis function，把27维参数输入其中得到rgb值（SH basis function中，可以输入相机中心到该点的方向即view direction来获得该点不同方向的颜色）。
2. 建HDR radiance时同nerf一样，从每个pixel发出一条光线，在光线上sample点，然后根据每个点所处的voxel进行插值（bounded space被voxel划分，同时也可以有连续的3d坐标，它们只是尺度不同，判断point位于哪个voxel是通过，将3d坐标（例如坐标位于0-1）值scale到voxel的坐标值来判断位于哪个voxel。例如voxel的shape为[256,256,256]，坐标值为(0.1, 0.2, 0.3)，那么将坐标值乘上256即可获得其位于哪一个voxel里），获得每个点的rgb值和density值，然后根据nerf的volume rendering来获得该ray（pixel）的$I_H$值。随着训练的进行，不含内容的voxel（所有顶点的28维参数均为0，且该voxel周围的所有voxel也满足参数都为0）会被删除，含内容的voxel会被进一步划分成更小的voxel来提高精度。实际的数据结构通过存储含有内容的voxel的indices来query voxel。
3. 得到$I_H$后，其会进入某个pose的相机，然后相机进行一系列加工将其转换为$I_L$。首先对rgb值进行白平衡，其次将白平衡后的rgb值去query CRF获得最终的LDR rgb值。

策略：
1. 因为white balance和exposure都是直接manipulate pixel intensity，所以在这里会有歧义，增大曝光时间和改变白平衡系数可能对pixel intensity的改变是一样的。，因此将它们的效果都归到white balance的3-channel系数中。作者发现在这样的策略下，white balance系数可能会被训练得非常大或者非常小。这一块的笔记做在了文中。
2. 除了exposure和white balance之间有歧义，white balance和SH coefficients之间也会有歧义。这一块内容笔记也做在paper中。
3. 在输入数据极其不稳定的情况下，在上述两种策略的加持下，训练的前期可能还是稳定的，但是后期当白平衡系数更新的速度与SH coefficients更新的速度不一致时，可能又会发生上述问题。解决方法的笔记在文中。
4. 过饱和区域、欠饱和区域的pixels的loss权重应该尽可能小，避免网络学习过饱和、欠饱和的模式。文中认为0.15-0.9的dynamic range不属于过饱和、欠饱和。

loss：
1. reconstruction loss中的saturation mask就是控制过饱和、欠饱和区域的loss权重。
2. CRF的smooth loss其实就是对256个控制点中的每个点算二阶离散导数($f(x+1)+f(x-1)-2f(x)$即为x点的二阶导数)，求其MSE并最小化。这使得CRF更加平滑，插值出来的最后的rgb值也会更加平滑（实际上位于两个控制点中间的部分都是连续的，因为是线性函数插值获得的。求二阶导数使其趋向于0使得分段函数的分段点更加平滑，即分段点两侧单侧一阶导数趋向相等，可导->连续）。
3. TV loss也是一种全局平滑，这使得相邻的density和SH coefficients更加连续，以保证空间geometry和颜色的一致性。

---

## NERF++: ANALYZING AND IMPROVINGNEURAL RADIANCE FIELDS

### innovation
1. NeRF在训练时，对synthetic dataset界定bounding depth以在这个depth range中取t值，对real dataset使用NDC将0->无穷的depth变换到0-1来sample当成0-无穷。这样的sample方式可能会不够精确，实际的foregroud内容可能只占了depth range的一小部分。本方法利用一个bounding sphere将foregroud和backgroud分开。分别采用不同的坐标来表示内外sample点的坐标，分别对内外sample点用2个MLP来获取rgb值和density值，进行volume rendering。

### methodology
精华部分都在paper section 4，笔记都做在paper中。

---

## Nerfies: Deformable Neural Radiance Fields

### innovation
1. Free capture system(hand-held monocular cameras: 1. Solve the problem of nonrigidity, i.e., cannot keep still. 2. Solve the problem of priors for previous work, here there is no priors, just regularization)
   1. Use elastic regularization to keep rigidity and allow existing nonrigidity like face.
   2. Use background regulatization to align object location.
2. 

### methodology
1. 利用canonical coordinate去建模一个template volume，其中包含static scene。
2. 然后为每一帧建一个observation coordinate和一个trainable deformation code，渲染方式与Nerf相同，唯一的区别就是sample的点需要同deformation code一起query deformation MLP来获得其在template volume中的坐标（即其相对于起初的static scene有了哪些变化）。利用mapping后的point去query Nerf MLP（含appearance code）获得rgb and density。

### detail
1. 通过hand-held的方式采集数据，但是因为人是动的，所以无法用colmap对人上的feature进行reconstruction。这里采用foreground mask，截掉foreground部分，仅利用background（static）部分的feature进行colmap reconstruction。
2. Elastic部分：
   1. deformation mlp将observation frame下的一个point X mapping到canonical frame下的一个point Y，这种映射由mlp隐式实现，我们无从得知具体的transformation matrix，但是可以利用Jacobian来近似得到这个transformation（Jacobian可以获得这个映射的最精确的first-order approximation）。由于一个n*n的matrix J代表着一个transformation，而这个transformation由scale和rotation组成，且这个J可以svd分解为$J=U\sum_{}V^T$，因为U和V都是orthogonal matrix，因此它们都是旋转矩阵，而$\sum_{}$是一个diagonal matrix代表着scale，因此svd就可以把这两种transformation decompose。由于我们在transformation中不想要scale，而只想要rigid transformation（rotation and translation），所以要把scale尽量变为1.
   2. 将scale变为1有多种方式。以前的paper是通过算J和$UV^T$的loss来达到目的，因为当它们俩严格相等时，也就是意味着$\sum_{}$为identity matrix。而本文直接通过singular value来优化。
   3. 在优化singular value时，取log的作用：当你考虑一个值为0.1和值为1.9的singular value的时候，不用log算出来的loss是一样大的，但这显然不合理，因为0.1意味着缩小的倍数是10倍左右，1.9意味着放大的倍数是2倍左右，在这样的情况下，缩小0.1倍这个样本应该有更大的梯度去优化网络，但是loss相同时网络并不能捕捉到这一点，我们需要让网络知道这一点。结果就是在这种不平衡的loss下，网络在训练多个样本之后，倾向于将，这样就会导致elastic loss更偏向于缩小。因此nerfies提出用log，这样0.1的loss和10的loss是一样的（正负号相反，但因为取abs，所以一样），就能控制网络不会偏向于放大或者缩小。
   4. 文章又同时考虑到，人脸等区域确实有nonrigidity部分，因此并不把这种transformation完全限制为rigid。于是作者加了一个robust loss，利用这个了loss对singular value求导后可以发现，对于那些value比较大的情况，loss只传很小的梯度去使得mlp 做rigid transformation，意思就是value比较大的情况就是代表着类似人脸变动这样的nonrigidity，我们不应该去强制限制其为rigid，所以对这样的样本不传递或几乎不传递gradient。而value比较小的情况，可能就确实是rigid部分，只不过离rigid有一些bias，因此我们对其施加regularization。
   5. 对rigid transformation的整体理解：通常我们说transformation都是一个matrix，但是因为这里用mlp implicitly encode the mapping，因此我们无法获得具体的transformation matrix，对于这个scene来说，可能对不同区域存在多个transformation matrix，但是因为我们是implicity mapping，我们可以整体理解为mlp是对整个scene的一个transformation，为了让这个transformation 是rigid的，我们就需要让sample到的点都满足scale的约束。由于mlp是连续的，因此对sample的点进行约束后，整体的mlp上的每个点都会倾向于scale=1，这就实现了整体的transformation的rigidity。
3. Background regularization部分：
   1. 这里通过colmap重建出来的sparse points的coordinates来约束在canonical和observation frame中，bg部分的point的坐标不应该改变。
   2. 原因：我们可以intuitively认为bg部分不会改变位置，因此让他们坐标保持不变很正常。此外，这种保持不变还可以有一个效果，就是如果我们不加这种约束，我们无法得到一个合理的canonical volume，会存在ambiguity，因为可以从不同的canonical volume（bg和fg整体都在空间中变动，这样就会有multi solution）通过不同的deformation来获得observation volume，我们无法得知每个observation volume源于对哪个canonical volume做deformation获得。但是施加这个regularization后，我们可以知道整体的scene就是固定在那不动的。
4. coarse to fine部分：
   1. 做法：在起初的iteration中，高频的positional encoding部分不加入网络训练，使得网络起初只学习smooth的部分；随着iteration增加，逐步加入高频的positional encoding，使得网络学习high frequency内容。
   2. 原因：应该是想到了这个story然后去做了实验，发现在当前task有效，然后强行解释以增加一个novelty。实际上在其他task上可能无效。
5. deformation code interpolation：这种linear interpolation根本没有理论依据，作者只是想到了可能会有用，就去做了尝试，发现有效果，但是其实没有理论依据，就是一种实验结果。

---

## Deferred Neural Rendering: Image Synthesis using Neural Textures

### innovation

#### problems in pervious work
1. 一般的rendering pipeline都需要输入良好的3D geometry、material、light等，这些以前通常由skilled artist来制作。虽然3D reconstruction可以重建这些内容，但是imperfect（noisy、over-smoothed、holes），这会导致rendering结果not photo-realistic。

#### improvements
1. 本篇文章最大创新点（经常重复）就是在imperfect geometry（几乎可以认为所有基于重建得到的geometry都是imperfect的）的前提下rendering效果不错。作者认为texture中包含可以弥补geometry imperfections的信息，但是traditional texture特性（normal、albedo etc）的information非常low-dimensional，因此其提出使用learnable feature vectors。（作者在ablation证明了即使geometry resolution非常小，rendering结果也不错）。此外由于Neural Rederer是采用conv的，会利用到周围pixel的信息，因此也可以弥补geometry的imperfection（以前的方法有用per-pixel的conv来得到pixel的value）。

### introduction
1. 第一段：介绍graphic rendering pipeline需要well-defined data（geometry、material、illumination等），以前通常通过skilled artist manually获得。现在通过3D重建可以获得，但是geometry not perfect。
2. 第二段：引出算法的启蒙。与其解决geometry的imperfection，不如修改rendering pipeline使rendering结果更好。然后介绍neural texture的意思（与传统texture map的区别）。
3. 第三段：说明本方法可以有很多application，比如view synthesis、scene editing。然后说明自己做了哪些实验证明这些application的效果不错。
4. 第四段：说明本方法在video中效果好，即temporally coherent。因为本方法基于3D space进行而不是image进行，因此可以获得时序上连续的结果。

### related work
1. Novel-view Synthesis from RGB-D Scans
2. Image-based Rendering（Debevec那种image blending）
3. Light-field Rendering（PBR model-based）
4. Image Synthesis using Neural Networks
5. View Synthesis using Neural Networks

### brief summary


### methodology
1. 视频抽帧用于colmap重建，得到pose和mesh以及texture mapping关系。
2. 对于每个view，先做rasterize。然后train一个texture map，其中存储了feature vectors。对于rasterize的image处的每个pixel，通过mapping关系获得其feature vector，然后将整张feature image输入Deferred Render得到最终的预测结果。
3. 对于texture map的resolution：traditional graphics中使用mipmap来解决over-sampling和under-sampling问题，这里也参考了mipmap。首先取low-resolution（512*512）的texture map，然后通过upsampling得到high-resolution的map，对于每张image，在每个level上都做sample然后输入renderer计算color值，最终的color值是由所有level的color值相加。low-resolution的map成为coarse level，high resolution成为finer level。
4. 在Renderer中，同时输入view direction（其由SH encode）可以控制view-dependent内容。

### limitation
1. 没办法做relighting（appearance editing）

---

