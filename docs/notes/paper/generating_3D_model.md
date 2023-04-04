# 3D Model Recovery

## Pixel2Mesh: Generating 3D Mesh Models from Single RGB Images

### setting
1. 从一张输入image估计出在当前camera view下的mesh（只看当前view，其它view应该不能实现multi-view consistency）。

### usage

### key contribution

### brief summary
xxx generates a 3D mesh from a single image by incorporating the perceptual image features into the GCNs to guide the mesh deformation process。

### methodology
1. 输入网络的是一张RGB image以及一个椭圆mesh（由Blender生成，含有一定量的vertices和faces）。
2. 把image过一个VGG-like CNN，抽取其中某四层的features用于mesh优化。（每个iteration image直接经过整个CNN，获得所有的features。只存在CNN向GCN传递信息，不存在GCN向CNN传递信息。）
3. Mesh优化的pipeline中共有3个Mesh deformation block（每个block做一次deformation）。每个block的输入为CNN传递过来的所有features（由于它们来自不同层的输出，因此resolution和dimension都不同）以及一个3D mesh（只含有vertices）。
4. 每个block首先利用输入的3D mesh的vertices坐标，将其投影到input image平面（224\*224）。然而，由于输入的image features已经被downsample，因此要根据当前的image features的resolution，将投影到224\*224图像平面上的点根据不同features的resolution计算其在不同feature平面上的location。然后利用邻近的4个pixels进行插值，得到这个3D vertice的不同features（从CNN中一共获得4个features，它们含有不同的分辨率和维度，这里分别计算在四个feature spaces上的投影，然后获得四个features，将它们堆叠）。
5. 得到projected后的features后，将其与mesh的vertices的coordinated堆叠，然后再将其与上一个mesh deformation block的倒数第二层输出堆叠，输入当前block的GCN。由于第一个block没有上一个deformation block，因此其只需要堆叠image feature和mesh坐标即可。
6. GCN可以理解为，每一层都生成一个matrice（类比于CNN的kernel），然后用这个matrix与输入的features相乘，得到多维的输出features（输出的features维度，可以根据matrix的第二维维度来控制）。每个deformation block，先经过多层GCN，保持维度在256，最后一层维度变成3维（坐标），代表完成了对mesh vertices的deformation（坐标改变）。然后将这个3维坐标以及倒数第二层的feature输入下一个block继续进行deformation。
7. 在第二个和第三个deformation blocks之前还经过Graph Unpooling。其在mesh的每条edges中点生成一个新的点，然后将生成的新的点连起来，代表生成更多的vertices和faces，增大mesh的分辨率。
8. Loss分析
   1. Chamfer loss：gt也是一个mesh（vertices），因此要算predicted mesh和gt mesh之间的distance。首先，为predicted mesh上的每个vertice找到其在gt mesh中距离最小的vertice（每个vertice找最近点可以并行），每个vertice的距离作为这个vertice的loss，所有vertices的距离加起来作为一个loss。然后，为每个gt mesh的vertice找到其在predicted mesh中距离最小的vertice，然后以其distance作为loss，做所有vertices都算这个loss。
   2. Normal loss：对于每个predicted mesh中的vertice，找到其所有的临近点，得到其与这些临近点的edges，作者认为这些edges应该与Chamber loss中找到的当前vertice在gt中的最近的点的normal垂直。这个loss可以保证，vertices的deformation不会生成过于steep的surface，能够保证较为smooth的surface。
   3. Laplacian regularization loss：完成一个deformation block代表经历了一次deformation。这个loss保证完成一次deformation之后，当前所有vertices相对于没有deformation之前的对应vertices，应该具有尽量相同的movement。这是为了防止deformation的过于随意性。
   4. Edge length regularization loss：防止flying vertices造成一个face特别大，因此加一个regularization使得每条edge的长度为0。

## DIB-R: Learning to Predict 3D Objects with an Interpolation-based Differentiable Renderer

### setting

### usage

### key contribution

### brief summary

### methodology

### new knowledge
为什么rasterization是不可微的？

- 通常我们定义的MLP、CNN等，它们都是以矩阵运算的，最终的结果都是input关于weight的线性函数（非线形是由激活函数引入的，但是激活函数都是连续的，所以本质上整个函数是连续的），如$MLP(x)= activation_2(w_2(activation_1(w_1(x))))$。因此函数的输出可以对输入的$x$或者各个weight算梯度，因为函数都是连续的。
- 3D坐标投影到2D坐标的过程都是矩阵运算，它们都是线性的，因此变换的函数$f$都是连续的，可微（可用$f$对$x,y,z$求导）。

  $$
    u = f(x, y, z)
    v = f(x, y, z)
  $$

- 在计算某一个pixel的颜色值时，其颜色值为其所属三角形的三个vertices的插值

$$
\hat{I}_p = w_0(u, v, p) * i_a + w_1(u, v, p) * i_b + w_2(u, v, p) * i_c
Loss = MSE(\hat{I}_p, I_p)
$$

- 若想要求loss对$x,y,z$的导数，来优化它们的坐标，则需要求$\hat{I}_p$对$w_0,w_1,w_2$的导数，进而求三个$w_n$对$u,v$的导数。
- 若要能求$w_n$对$u,v$的导数，要求$w_n(u,v)$必须是连续函数。但是我们可以发现$w_n$函数在定义域内并不是连续的。举个例子，当$(u, v)$位于某一个三角形的顶点时，当微小的$\delta u$及$\delta v$使得$(u,v)$走出了当前三角形时，所有的$w_n$都会从原来的值瞬间突变到0，因此其并不是一个连续函数，不能简单求梯度。