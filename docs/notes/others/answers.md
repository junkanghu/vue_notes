# Solutions for different issues.

## train网络的trick

### 如何给网络多加一些loss促进优化
参考
Deep Reflectance Fields
中的task-specific VGG loss

### 如何算mask loss
cross entropy loss
Dice function loss

### 若训练数据分辨率高如何加快训练速度
在low-reso上train，在high-reso上fine-tune

### 网络有多个stage的时候，如何增强网络稳定性
1. 可以使用前面stage地gt作为后面stage的输入，使得后面stage先收敛。

## 如何在不做deformation的时候减少OLAT拍摄的image的motion影响（optical flow）
参考
Deep Reflectance Fields
首先做一个用trakcing frames做coarse optical flow，然后在训练时也继续优化。

## optical flow library
1. https://developer.nvidia.com/opticalflow-sdk

## 如何在不用network的前提下获得任意一张image的coarse albedo用于网络初始化
参考
De-rendering 3D Objects in the Wild

## 如何获得objects任意point light下的OLAT image
参考
Deep Reflectance Fields

## 想要用OLAT拍摄dynamic scenes可参考的方案
参考
Deep Reflectance Fields

## 如何用OLAT获得per-pixel normal以及per-pixel phong model components
参考
Cosine Lobe Based Relighting from Gradient Illumination Photographs
中的color gradient illumination

## 做sfm的多种lib
COLMAP
Metashape

## 如何将3D geometry map到一个比较好的texture space
PRNet（Joint 3D Face Reconstruction and Dense Alignment with Position Map Regression Network）

## 如何直接估计image normal
1. 参考 Deep Single-Image Portrait Relighting
2. 

## 如何直接估计一张image的SH light
在DPR中指出可以用SfSNet

## 如果两个value或image只有亮度或强度不同，怎么衡量它们的distance
使用invariant Mean Squared Error，参考DPR

## image-to-image relighting数据集
1. Lumos
2. Single Image Portrait Relighting via Explicit Multiple Reflectance Channel Modeling
3. DPR数据集

## 如果要做合成数据集，怎么获得shadow map和specular map的gt
参考
Single Image Portrait Relighting via Explicit Multiple Reflectance Channel Modeling
1. 在blender中设置specular为0和设置specular为某个参数，相减得到specular map
2. 设置visibility为0和1得到两张image，相减得到shadow map。

## 如何获得face parsing
1. manually：参考Single Image Portrait Relighting via Explicit Multiple Reflectance Channel Modeling
2. library：https://github.com/zllrunning/ face-parsing.PyTorch

## 如何算parsing loss
参考
Neural Video Portrait Relighting in Real-time via Consistency Modeling
中的parsing loss。

## 如何算predicted light和gt light的loss
参考
Single Image portrait relighting
light之间要加一个log

## 材质数据集
MERL dataset

## 如何控制predicted components的smoothness
控制网络学习smoothness，就是在$f(x)$和$f(x + \epsilon)$加一个loss。

## 如何估算Nerf的normal和visibility
Nerf的normal是通过对density求梯度算得，Nerf的visibility是通过算transmittance获得，而某条光线的intersection surface point是通过将volumetric rendering中的color替换成depth t来获得的。

## 如何可视化预测的albedo，使其与gt相似
由于albedo的亮度是任意的，因此在可视化时，一种可靠的做法是，取一个scale值，使得估计的albedo和gt albedo之间的MSE最小。

## 现有的face recognition pretrained library ｜ 如何使portrait relighting时的face identity不改变
Deep face Recognition
其含有pretrained net，可以预测face identity的descriptor，我们可以用这个descriptor给face identity加loss。

## 如何判断某些值是否发生了突变
在计算某个view下某个值是否有突变时，可以将其投影到image上，算其Sobel算子（梯度），梯度大的地方代表发生了突变。参考IRON，利用这种方式检测edge pixels。

## 如何提升latent code的效果
参考Modeling Indirect Illumination for Inverse Rendering。
可以对latent code施加KL散度

## 如何建模indirect illumination
参考Modeling Indirect Illumination for Inverse Rendering。
用Nerf对场景进行建模。

## train SDF net时候的初始化
最好根据PhySG中引用的paper对SDF net进行初始化，使其shape为一个sphere，防止不收敛。

## unsupervised inverse rendering能加的supervision
参考InverseRenderNet。
施加MVS supervision。

## 对albedo如何施加smooth loss
1. 对object来说，不能简单地对每一个pixel都加，因为object可能有颜色突变，要考虑对没有颜色突变的区域加loss。可以参看InverseRenderNet，采用颜色差异施加loss权重。
2. 对人脸来说，可以直接对每个pixel都加smooth loss，因为颜色基本不会发生突变。

## 如何构建statistics model来约束分布
参考InverseRenderNet。

## 获得portrait alpha matte/ portrait mask
MODNet: Trimap-Free Portrait Matting in Real Time
github: https://github.com/ZHKKKe/MODNet

## 获得object mask的方式
https://www.remove.bg/zh

## directional light关于self-occlusion的visibility建模
参考Sunstage。

## 进行texture mapping（计算mesh到texture coordinate的映射）的方式
xatlas库