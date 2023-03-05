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