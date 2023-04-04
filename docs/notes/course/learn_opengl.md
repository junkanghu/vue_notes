# Notes for learning opengl

<link rel="stylesheet" href="/katex.min.css">

[[toc]]

## function detail
1. （GLSL）*reflect(lightDir, normal)*：lightDir必须是从light指向vertex，normal就是正常的方向。我们一般算lightDir时是算的从vertex到light的方向，因此如果要用这个函数，需要取负。**其返回的是unit vector**
2. （glm）*glm::translate(model, glm::vec3())*：其中的glm::vec3这个向量代表的是要将当前顶点的坐标加上这个vec3。
3. (GLSL)*texture(texture_object, TexCoord)*：一般用在fragment shader中，其中的*TexCoord*是vec2的纹理坐标，*texture_object*，其返回一个vec4的color vector，直接作为fragment shader的输出。如果要直接获取vec3的rgb值，则需要用*texture(..., ...).rgb*来索引。
4. (GLSL)*clamp(value, min, max)*：这个函数将变量*value*中的所有值都clmap到\[min, max\]之间。
5. (GLSL)*length(Position1 - Position2)*：这个函数用来算向量的长度。
6. (GLSL)*reflect(lightdir, norm)*：这个函数用来算反射方向。normal为正常的normal方向，但是*lightdir*为从light射入点的方向。所以不管求什么方向的反射方向，入射方向一定要是射入点的方向。
7. (GLSL)*dot(vec3 a, vec3 b)*：算两个方向向量a、b之间的点乘。
8. (GLSL)*pow(anytype a, float b)*：算a的power。
9. (GLSL)*max(float a, float b)*：算a，b的最大值。同理，可用*min*算最小值。
10. (C++)*offsetof(struct a, attribute b)*：返回在一个struct中定义的attribute b的位置偏移。

## getting started

### 各种函数用法注释索引
1. window的一些初始化以及rendering loop中的注释，查找*hello_window*。
2. GLSL写的shader中的基本注释，以及初步定义shader和各种object用于第一次渲染，以及如何改变画三角形的方式（只画线或填充式画），查找*hello_triangle*。
3. 多个pointer的使用注释、第一次使用header中的shader、以及如何用uniform，查找*shader*。
4. 如何使用texture（初始化、Mipmap），查找*texture*。
5. 如何使用matrix等transformation，查找*transformations*。
6. 如何从local space转换到clip space的transformation过程、glm的平移、旋转等用法，查找*Coordinates*
7. 直接计算坐标系变换矩阵、deltaTime作用和计算，查找*camera*

### GLFW and GLAD
1. GLFW是一个用于帮助opengl从os独立出来的library，使得opengl的各种函数不受os的限制，走向更底层硬件。
2. opengl只是指定了渲染的方式，定义了context，要实现rendering，需要硬件去执行。opengl的drivers有很多，每个drivers的function存放位置不同，容易导致不兼容而找不到渲染函数。GLAD就是为了找到这些driver function而诞生的，它也是独立于os的。

### Hello Window
1. include时GLAD必须在GLFW之前，因为GLFW需要用到其中的内容。
2. window中设置的size指的是整个opengl运行窗口的大小，而viewport中设置的渲染窗口size指的是在整个opengl运行窗口中用于显示渲染部分的窗口大小（opengl运行窗口除了渲染窗口还可以有一些setting的部分）。
3. 在opengl运行时所有的坐标都位于[-1, 1]，因此为了让渲染结果正确地出现在屏幕上，指定了viewport的width和height，使得[-1, 1]能够线性地映射到[width, height]上，正确地在屏幕上显示。
4. double buffer：应用程序使用单缓冲绘图时可能会存在图像闪烁的问题。 这是因为生成的图像不是一下子被绘制出来的，而是按照从左到右，由上而下逐像素进行渲染并显示在屏幕上。最终图像不是在瞬间显示给用户，而是通过一步一步生成并显示的，这会导致渲染的结果很不真实。为了规避这些问题，我们应用双缓冲渲染窗口应用程序。front buffer保存着最终输出的图像，它会在屏幕上显示；而所有的的渲染指令都会在back buffer进行。当所有的渲染指令执行完毕后，我们交换(Swap)前缓冲和后缓冲，这样图像就立即呈显出来，之前提到的不真实感就消除了。本质上是用渲染完后再显示替代边渲染边显示。glfwSwapBuffers就是交换这两个buffer。

### Hello Triangle
1. primitives：图元。用其来告诉opengl我们要画什么形状（triangle、points等），primitives有*GL_POINTS*, *GL_TRIANGLES*, *GL_LINE_STRIP*。
2. rendering pipeline
   1. 宏观：
      1. 将3D坐标转换为2D坐标。
      2. 将2D坐标转换为带颜色的pixels。
   2. 微观
      1. pipeline：vertex shader -> shape assembly -> geometry shader -> rasterization -> fragment shader -> test and blending。
      2. 概念
         1. 每一步用到上一步的输出。
         2. 每一步都可以并行（parallel）运行。
         3. 每一步内运行的小programs被称为shader。
      3. 作用
         1. vertex shader：一个vertex代表着这个vertex的所有attributes（坐标，颜色或者是neural textures都可以）。vertex shader用于对vertex的坐标进行处理（如将坐标归一化到NDC，opengl只处理坐标值位于[-1, 1]的坐标），并对其attributes做一些处理。**vertex shader每次只接收一个vertex并处理**。
         2. shape assembly：根据选择的primitives将vertices进行分类并assembly。
         3. geometry shader：vertex shader的输出optionally输入其。其用于将之前的primitives进行加工形成新的shape。
         4. rasterization：将NDC坐标进行CLIP并project到screen上。
         5. fragment shader：rasterization只是获得了每个pixel内对应着哪些3D vertices，但是每个vertices都有很多attributes。在这个stage，就是利用这些vertices的attributes计算最终的color（如PBR在这个stage进行）。
         6. test and blending：根据pixels内所有点的depth和alpha选择显示的内容，opaque时只显示最前面（depth最小）的内容，否则要将vertices的内容进行blending。
   3. code层面的流程
      1. init window。
      2. 写出vertex shader和fragment shader的GLSL code。
      3. 定义vertex shader和fragment shader -> 将写的GLSL code送入定义的shader -> 对shader进行编译 -> 检查编译是否成功。
      4. 定义program，将vertex shader和fragment shader attach到program上，然后对program进行link（使得前一个shader的输出能够输入到后一个shader），检查link是否成功。link完没有error后，delete之前定义的两个shader。
      5. 定义VAO和VBO，先绑定VAO到vertex array上，然后绑定VBO到BUFFER上（VBO bind后不是bind到VAO上，定义pointer后才算将VBO代表的内存地址送给了VAO） -> 将数据送入VBO中 -> 定义VAO理解VBO中数据的方式（有了pointer就是有了数据的真实内存地址，因此后续可以unbind VBO，不需要VBO再提供什么信息） -> 使得刚定义的pointer使能 -> unbind VBO -> unbind VAO。
      6. 在loop中use program -> bind VAO以获得想要使用的数据 -> draw
      7. 完成project后，delete VAO、VBO、program
   4. 注意事项：所有申请的buffer，定义的object在project结束的时候必须全部释放。一些申请的buffer绑定到array上并定义pointer后就可以从array上unbind，以供后续的buffer bind并定义pointer。

3. 在opengl中，vertex shader和fragment shader必须由我们定义，其没有default one。
4. opengl的screen coordinates的y轴向上，x轴向右，原点在screen中心。
5. 任何buffer object都有一个唯一的buffer ID，可以由我们来指定。通过调用*glGenBuffers*来生成指定ID的buffer。通过buffer ID生成buffer后，我们无法直接通过buffer ID去操纵这个memory，必须将这个buffer bind（捆绑）到opengl中的buffer容器中，opengl共有8种不同的buffer容器，对应不同的数据类型。通过调用*glBindBuffer*函数可以实现捆绑，这样我们就可以通过直接调用这个容器来操纵buffer。一种类型的buffer容器每次只能容纳一组数据，每次调用bind时，就是将一组数据捆绑到上面，之前捆绑的数据失效，因此**每次需要用到新的数据时都要重新捆绑**。当捆绑VBO捆绑完成后，我们就可以用*glBufferData*将CPU中的数据送入这个buffer。
6. 将数据送入vertex shader就是在GPU中为数据创造buffer，其称为vertex buffer objects（VBO）。从CPU传递数据到GPU比较慢，这个buffer能够保证数据立马能够被GPU取到。通过调用*glBufferData*将定义在CPU中的数据装入指定的bound buffer。

### shaders
1. 输入vertex shader的vertex attributes有最大数量限制，不过一般至少大于16个。
2. 可定义的数据类型：
首先是C语言中的基础变量都可以定义
可用.x .y .z .w去query vec各个分量
``` 
vecn # 默认的float类型向量，长度为n
bvecn # 长度为n的bool类型向量
ivecn # 长度为n的int类型向量
uvecn # 长度为n的uint类型向量
dvecn # 长度为n的类型向量，每个分量含有两个值
```
3. swizzling功能，自由定义vec
``` 
vec2 someVec;
vec4 differentVec = someVec.xyxx;
vec3 anotherVec = differentVec.zyw;
vec4 otherVec = someVec.xxxx + anotherVec.yxzy;
```
4. 初始化定义向量
``` 
vec2 vect = vec2(0.5, 0.7);
vec4 result = vec4(vect, 0.0, 0.0);
vec4 otherResult = vec4(result.xyz, 1.0);
```
5. 前一个shader的out变量若与后一个shader的in变量在定义时候的变量名称一样，opengl会自动将值传递。
6. 可以用uniform来自由改动一个整个shader program中定义的变量。在一个shader program中定义的uniform变量，可以在这个program中的任何地方调用，但不能被其他program调用。
7. **注意：如果自定义了一个uniform变量，但是并没在program的任何一处地方调用它，则在编译时会默认将这个定义的变量移除**
8. opengl的内核是C语言，不支持函数重载（一个函数可以接收多种输入组合，输出多种输出组合，即同名函数定义多种用法）。因此我们在设置不同类型的值时，必须用不同的function，无法用一个function。以下为多种数据设置function。

```
glf() # 设置float类型变量的值
gli() # 设置int类型变量的值
glui() # 设置uint类型变量的值
gl3f() # 设置3 float类型变量的值
glfv() # 设置float vector类型变量的值
```
9. 如果定义了不同的顶点颜色，则在设置模式为只画线时，每条线上的颜色会被做插值处理；如果设置模式为整个多边形进行颜色填充时，整个多边形会被做插值处理。

### textures
1. 在opengl中使用texture，只需要在vertex shader中指定每个vertex的texture coordinates就行，每个pixel的coordinates会根据vertex的值进行interpolation。
2. texture wrapping：当我们的2D texture坐标超出范围时，可以用*glTexParameteri*来逐坐标轴（纹理图的x和y轴）指定如何处理超出的坐标（将original纹理图进行repeat、mirrored repeat、截断坐标到边界，截断到user-specified 边界），当使用截断到user-specified边界时，需要指定color，意思就是超出这个边界的坐标一律采用这个color，用*glTexparameterfv*指定。
3. texture filtering：实际上就是指定sampling的interpolation方式，一般在texture resolution比被贴图的图像大时用linear interpolation，小时用nearest。用*glTexparameteri*设置interpolation方式。
4. Mipmaps：根据object离viewer的远近设置不同resolution的texture maps，可以用*glGenerateMipmap*自动生成Mipmaps。存储在memory中的Mipmaps的数量肯定是有限的（对应着不同的具体距离），当我们的距离位于这些距离之间时，可以通过interpolation来形成一张新的mipmap进行sampling。我们可以用*glTexParameteri*来同时设置mipmap的插值方式和在maps上sample的方式。
   注意：不存在对Mipmaps运用magnify filter，因为Mipmaps最大的resolution就是与被贴图的图像匹配的。

5. GLFW中的texture()函数，是自带的函数，用于对txture进行采样。
6. GLFW中的mix函数用于对texture进行混合。
7. opengl中对图像的坐标理解是，原点在图像左下角，x轴朝右，y轴朝上；但是一般的image在存储时默认都是原点在左上角，x轴朝右，y轴chaoxia。因此在load进opengl时需要进行flip，stb_image可以做到，要用*stbi_set_flip_vertically_on_load()*.
8. 在texture中与VAO、VBO有一点不同的在于，VAO等一次只能bind一个object，即激活一个object，当需要使用其它的object的时候，需要再次bind那个object。但是在texture中，由于我们有mix texture的需求，因此希望能够一次activate两个texture map。为了迎合这种需求，*GL_TEXTURE_2D*上有多个texture units，在不用*glActiveTexture*的前提下，默认激活第0个unit（与此同时，在shader中定义*uniform sampler 2D*时，也默认使用的是unit=0的texture，因此如果我们只有一个texture，既可以不适用active就直接bind，也可以不用设置uniform的textureID），每个unit只能放一个texture，且多个units可以同时激活。在*glBindTexture*时，我们默认把texture bind到*GL_TEXTURE_2D*上面的第0个texture unit上面，为了使用多个texture，我们可以激活不同的texture units，然后分别把不同的texture bind到上面，可以使用*glActiveTexture*来激活不同的texture units。
   - 注意：glActiveTexture(GL_TEXTURE0)中可以激活的texture units一般最多为16个，因此最大为GL_TEXTURE15。且0-15是连续定义的，即GL_TEXTURE15=GL_TEXTURE0 + 15，这使得我们可以用loop来操纵多个texture。
9.  

### transformations
1. glm的旋转矩阵生成时（用*glm::rotate()*），**所绕的轴必须是unit vector**，必须做归一化。
2. **注意：在opengl中矩阵在内存中的存储顺序是列优先，而在GLM中矩阵的存储顺序也是列优先。这代表着在两个library中，给定矩阵的首元素地址，它们是根据列优先顺序去读取后面memory中的value的，如果我们的存储顺序不是列优先而是行优先，会导致读取后相当于做了一个转置。由于GLM和opengl都是列优先，因此不需要转置**
3. glm::translation(model, glm::vec3())的效果就是，将原来的点的坐标加上其中的平移向量。
4. 

### Coordinates
1. 坐标变换顺序：local space（以object中心为原点的坐标系） -> world space -> view space -> clip space（如果一个primitives，如三角形的一部分在clip space外，opengl会自动进行填充，确保primitives是完整的）-> screen space（clip space后通过*glViewport*，即viewport transform后，转换到屏幕坐标）。
2. 把坐标转换到clip space后（能看见的都在[-1, 1]），vertex shader会自动进行perspective division（处以w分量）和clip。进行完perspective division后的坐标即在NDC（normalized device coordinates）中。
3. opengl的3D坐标系朝向为，x朝右，y朝上，z面向viewer，即满足右手定则。**但是，在NDC中坐标系被转换成了左手定则**
4. opengl是一个三角形一个三角形，一个fragment一个fragment画的，因此如果没有z-buffer存储depth信息，pixel value会被overwrite。在opengl中z-buffer是默认disabled的，可以通过*glEnable*使得z-buffer开启，也可以使用*glDisable*关闭z-buffer。
5. 对vertices进行坐标变换时，在定义GLM的matrix时，可以这样去理解：每当定义一个transformation矩阵时（从一个space变换到另一个space），viewers的位置都不变，只是将vertices的位置变了，以这样的方式去理解matrix变换。GLM定义matrix时，给用户的api也是这么去理解的，用户指定vertices的坐标怎么变，GLM会自动去生成这样的matrix，模拟坐标系变换。
6. FOV越大，意味着相同的屏幕分辨率的屏幕需要更接近相机光心（即焦距更小），此时物体在屏幕上会显得更小；也可以理解为FOV越大，能够看到的范围越大，但屏幕分辨率不变，因此object在屏幕上占有的pixels数量会更小。
7. 在FOV不变的情况下，改变aspect ratio，会有使object看起来被拉伸的感觉。
   1. ratio不管怎么变，虚拟的屏幕（因为变的只是ratio而不是屏幕分辨率）与真实屏幕重合，但是其分辨率与真实屏幕不同。虽然物体投影在两个屏幕上的位置相同，但是对于虚拟的屏幕来说，其NDC坐标与真实屏幕肯定不同（宽和高不同，且坐标位于[-1, 1]，因此会不同）。造成的结果就是，在虚拟屏幕上的NDC坐标被用到真实屏幕上去做viewport transform，因此在真实屏幕上看着不同。
   2. ratio变小时，相当于相同的屏幕，W增大，看起来就是object的高度不变，宽度被缩小了；ratio变大时，相当于相同的屏幕，W减小，看起来就是object的高度不变，宽度被拉伸了。

### camera
1. 坐标系变换矩阵计算用*glm::lookAt()*，其用法记录在camera中的*walk_around.cpp*
2. 由于晶振等硬件的不同，不同pc执行指令的速度不同，因此单位时间内进入rendering loop的次数不同，这意味着单位时间内渲染出来的帧数不同（因为进入循环一次代表渲染出一帧），如果我们设定一个恒定的速度（*walk_around.cpp*），那么单位时间内移动的距离就会不同，因为每帧都会移动，而用户感知的不是帧，而是单位时间内的场景变化。这就造成了不同pc在单位时间内渲染的结果不同的情况。为了解决这个问题，需要维护全局的*delta_Time*。其用于记录每一帧的渲染时间，并控制移动速度与这个*delta_Time*相关，那么在单位时间内，object移动的距离在所有的pc上都会一致。虽然不同pc的帧率不同了，但是在用户看起来，它们的速度却是一样的。
3. 欧拉角（Euler angles）：
   1. pitch：俯视、仰视
   2. yaw：转头左看、右看
   3. roll：向左下扭头、向右下扭头
4. 坐标系变换：
   1. 理解：其实在opengl中。要将当前坐标系变换到另一个坐标系，就是把当前所有点的坐标变成在另一个坐标系中的坐标，然后以变换后的坐标进行显示即可，可以理解为我们的观察位置和方向始终不变，变的只是点的坐标。
   2. 将另一个坐标系变换到当前坐标系：
      1. 算出另一个坐标系的各个坐标轴在当前坐标系的单位方向向量，然后将其组成3*3列矩阵，并在最后一列加上另一个坐标系的坐标原点在当前坐标系的位置，即可得到3\*4的transform矩阵
         $$
         \begin{bmatrix}
            X_x & Y_x & Z_x & P_x \\
            X_y & Y_y & Z_y & P_y \\ 
            X_z & Y_z & Z_z & P_z \\
         \end{bmatrix}
         $$
         其中$[X_x, X_y, X_z]$为另一个坐标系的x轴在当前坐标系的单位方向向量，其余类推。$[P_x, P_y, P_z]$为另一个坐标系的原点在当前坐标系的位置。

         也可以用4*4的矩阵乘法来算出变换矩阵，由于先旋转和后平移、先平移和后旋转的效果不同。为了简便，我们先进行旋转，然后进行平移。

         $$
         \begin{aligned}
            R = \begin{bmatrix}
                 X_x & Y_x & Z_x & 0 \\
                 X_y & Y_y & Z_y & 0 \\ 
                 X_z & Y_z & Z_z & 0 \\
                 0 & 0 & 0 & 1 
               \end{bmatrix}
         \end{aligned} \\
         \begin{aligned}
            t = \begin{bmatrix}
                 1 & 0 & 0 & P_x \\
                 0 & 1 & 0 & P_y \\ 
                 0 & 0 & 1 & P_z \\
                 0 & 0 & 0 & 1 
               \end{bmatrix}
         \end{aligned}
         $$
         先旋转再平移即：
         $$
         \begin{aligned}
            t * R = 
               \begin{bmatrix}
                 1 & 0 & 0 & P_x \\
                 0 & 1 & 0 & P_y \\ 
                 0 & 0 & 1 & P_z \\
                 0 & 0 & 0 & 1 
                  \end{bmatrix}
                  \begin{bmatrix}
                     X_x & Y_x & Z_x & 0 \\
                     X_y & Y_y & Z_y & 0 \\ 
                     X_z & Y_z & Z_z & 0 \\
                     0 & 0 & 0 & 1 
                   \end{bmatrix}
         \end{aligned} \\
         $$
         结果同上面一样
   3. 将当前坐标系变换到另一个坐标系：
      1. 由于旋转矩阵是正交矩阵，因此其转置和求逆一样。如果我们首先得到了上面的矩阵，最直接的做法就是对上面的矩阵求逆即可得到我们想要的矩阵，但是若事先没有上面的矩阵，我们也可以直接求。由于旋转矩阵的正交性，我们只需要对上面的旋转矩阵做一个转置即可得到我们的反向旋转矩阵。
      $$
      \begin{aligned}
         R^T = \begin{bmatrix}
               X_x & Y_x & Z_x & 0 \\
               X_y & Y_y & Z_y & 0 \\ 
               X_z & Y_z & Z_z & 0 \\
               0 & 0 & 0 & 1 
            \end{bmatrix}^T
      \end{aligned} \\
      $$
      对于t矩阵的理解很也很直观，现在只需要在另一个坐标系中，当前坐标系原点的位置即可。其即为上面的平移向量的反向，即求负。
      $$
         \begin{aligned}
            t^{-1} = \begin{bmatrix}
               1 & 0 & 0 & -P_x \\
               0 & 1 & 0 & -P_y \\ 
               0 & 0 & 1 & -P_z \\
               0 & 0 & 0 & 1 
               \end{bmatrix}
         \end{aligned}
      $$ 
      现在需要注意的是
      $$
      p_{current} = t*R*p_{target} \Rightarrow p_{target} = R^{-1}*t^{-1}*p_{current} \\
      p_{target} = R^T*t^{-1}*p_{current} 
      $$
5. glm中的矩阵：
   1. 内存中组织方式：对于一个矩阵，其在内存中以列优先方式存储，即前4个内存单元为第一列，5-8个内存单元为第二列，以此类推。
   2. 索引方式：由于其在内存中的组织方式为列优先存储。因此在索引矩阵时，不是按照以往的第一个索引位置代表行，第二个代表列，而是相反。即若$A$是一个4*4的矩阵，则取其第二列为$A[1]$，取其第一行第二列元素为$A[1][0]$而不是$A[0][1]$。
   3. 初始化一个矩阵：既可以在定义时初始化，```glm::mat4 A = glm::mat4(glm::vec4, glm::vec4, glm::vec4, glm::vec4)```。也可以首先将其初始化为identity矩阵，然后按列索引，分别放入4维列向量。

## Lighting

### colors

### basic lighting
1. phong model中含有ambient lighting、diffuse lighting和specular lighting。
2. 由于在opengl中画triangle时，是根据组成triangle的三个vertices自动进行插值得到triangle的颜色，因此我们只需要计算每个vertices的颜色即可，插值会自动进行（我们可以指定插值方式）。
3. 在shader中，即用GLSL写code时，*normalize*函数可直接用于向量单位化。
4. normal的定义是**垂直于surface的direction vector**。如果在当前坐标系中，其垂直于某一个surface。但是当进行坐标变换后，surface发生了形变（scale），则不能简单地将刚才的normal进行同样的坐标变换得到新的坐标系下的normal，因为与surface不垂直，而根据定义其应该是垂直与新的surface的direction vector。
5. homogenous coordinates只针对于vertex定义，因此对于normal来说，其没有homogenous coordinates。因此对于原来的4\*4的transform matrix，其属于translation的那部分（第四列）不应该对normal的变换有任何地影响（因为normal的w分量没有定义，w分量才会与这一列有交互）。但是为了normal能与
4\*4的matrix相乘，我们使得normal的w分量为0，这就可以把translation的部分disable。
6. 不管transformation矩阵的具体意义，一个矩阵可以被分成rotation、translation和scale三部分。当transformation矩阵的scale部分全为1时，对normal进行变换时，可以只取变换矩阵（4\*4）的前3\*3部分对其进行旋转，变换其方向即可，此时变换后normal还是垂直于surface。但是如果其scale不是全为1，那么直接用变换矩阵的前3\*3部分对其做变换，会导致变换后的normal不与变换后的surface垂直。**因此，我们可以认为当一个变换矩阵只含有旋转（3\*3矩阵正交）和平移部分时，normal可以直接用model matrix的前3\*3部分进行变换，否则需要用到normal matrix。其通过先算model matrix的前3\*3部分的inverse，然后再求其transpose获得**。
7. opengl中在vertex shader中做phong shading称为Gouraud shading，只有在fragment shader中做phong shading才称为phong shading。因为在vertex shader中做phong shading，只对所有顶点做shading得到它们的颜色，在fragment shader中，顶点包含的pixels（fragments）的颜色仅仅只是这些顶点的线性插值。但是如果在fragment shader中做shading，相当于每个fragment都能够从vertex处插值得到用于PBR的各个component，然后在每个fragment处都进行PBR，这样看起来的效果会更加smooth。
8. 一般我们在做shading都是在world space做的，若想要在view space做shading。要改变的变量就是vertex shader中顶点、normal、和light position的坐标，而vertex shader中的*gl_Position*不能改变，否则顶点的位置就会改变。还需要改变fragment shader中的camera position，因为camera position在此时已经变成了原点。

### materials
1. 在使用phong shading时参照的材质http://devernay.free.fr/cours/opengl/materials.html。为了使用这个材质，ambient、diffuse、specular的light intensity都必须设置为vec(1.0f)才能与这个表的setting相匹配。

### lightmaps
1. **png格式的image含有RGBA四个通道，因此在读取image作为texture时，必须要用GL_RGBA，否则图片内容会出错**
2. *sampler2D*只能搭配*uniform*定义，不能实例化。因此当其在struct中被定义时，这个struct也只能用uniform定义。

### light casters
1. 当我们将一个点的三维坐标表示成homogenous坐标时，w分量需要为1.0。但是若是想把方向向量的三维坐标表示成homogenous坐标，方便其与4\*4的matrix相乘时，我们需要将w分量设置为0.0。
2. 一般我们将点光源强度随距离的attenuate定义为平方衰减，这是为了简便。但是实际上有更为精确，但也更复杂的表示方式：

   $$
   F_{a t t}=\frac{1.0}{K_c+K_l * d+K_q * d^2}
   $$

   其中，$K_c$一般为1，以确保分母不会小于1。这个式子的衰减曲线如下：
   ![attenuate](/images/attenuate.png)

   一般取值规律如下：
   ![param](/images/param.png)

   第一列代表什么距离范围。一般在我们的例子中，32-100差不多了。
3. spotlight与point light的区别是其只往specific direction辐射光线，而不是向所有方向辐射光线。spotlight在空间中由三个量来表示，分别是其position（相当于point light）、light direction（辐射光线的正中心）、以及cutoff angle（往多少角度内辐射光线）。

![spotlight](/images/spotlight.png)
4. Flashlight是spotlight的一种，其与camera location是co-located的。
5. Flashlight由于有cutoff，因此要在cutoff处使用smooth，否则过于sharp的cutoff看起来会非常不realistic。通常是设置一个过渡角度，在这个过渡角度内，flashlight的intensity随着cutoff线性递减，直到为0，而在cutoff角度内，其intensity为1。

## Loading Model
1. Assimp的数据结构如下
   ![assimp](/images/assimp)
   1. Scene、Mesh、Node、Material都是class类型的数据，因此在定义时都需要定义指针。
   2. Root Object为*Scene*。其中包含了RootNode的指针（指向一个node，可用其索引其它node）；mesh的索引数组（数组中每个element代表一个Mesh Object）；meterial的索引数组（每个element代表一个material）。
   3. 每个Node中，都含有其children的指针，以及指向一个mesh的index。这个index用于在scene object的Mesh数组中索引某一个mesh。
   4. 每个Mesh中，vertices、normal、texcoord、face都是数组，而material index是int类型，用于索引Scene object中的material数组中的某一个Material object。这些数组应该都是二维数组，因此在索引到某一个数组的行index时，得到的应该是一维数组的首元素地址（指针）。

2. 如何在Blender中生成我们当前code可以运行的obj文件，参考https://www.youtube.com/watch?v=4DQquG_o-Ac

## Advanced OpenGL

### Depth testing
1. 在OpenGL中，depth testing默认在fragment shader中进行。fragment shader会判断每个vertex所处的fragment，当判断vertex a处于fragment b中时，fragment shader会拿a的z value与fragment b的z-buffer比较，当满足一定条件（一般是顶点的depth小于z-buffer中记录的depth值时）时，z-buffer值会被这个a的z value值所更新，且a的顶点属性值也会被送入b而更新b。当所有的vertices都判断完全后，每个fragment所含的顶点属性值，都是离相机最近的顶点的属性。
2. 当某些fragment的depth testing失败的时候，这些fragment会被丢弃（值都为0）。
3. OpenGL默认禁止depth testing，因此我们需要手动打开。可以用*glEnable(GL_DEPTH_TEST)*打开。
4. *gl_FragCoord*指的是图像平面上的坐标（x, y, z都处于\[0, 1\]，且左下角为原点），其中的z就代表这个fragment当前存储的顶点的depth。
5. 每当进入一个rendering loop时，我们都需要清空每个fragment的z-buffer，否则其记录的是上一帧的z-buffer值。可以用*glClear(GL_DEPTH_BUFFER_BIT)*进行清空。
6. 如上面所说，depth testing默认在fragment shader中进行。在渲染时，如果可以，我们尽量要避免在fragment shader中进行过多的操作，这会降低速度。因此，OpenGL中可以选择进行*Early depth testing*，使得depth testing在fragment shader之前就完成。此时，由于在fragment shader之前已经完成了depth testing，因此每个fragment shader中都存储了最终应该存储的顶点及其属性值，所以我们不应该再继续更新z-buffer，也不应该继续更新fragment中所含的顶点。
7. 在有些情况下（当前所有fragment的z-buffer固定，然后拿其它顶点的z value与buffer比较，若满足条件则更新fragment的顶点。此时并不实时更新z-buffer），我们不希望更新z-buffer，只需要拿它做个比较，即read-only。这可以通过调用*glDepthMask(GL_FALSE)*实现，其只在depth testing被enabled的情况下才有效。
8. 我们可以设定z-buffer和fragment attributes的更新规则，这通过调用*glDepthFunc()*实现，其只在depth testing被enabled时才有效。默认使用的是*GL_LESS*选项，其代表只在顶点的z value小于z-buffer时更新z-buffer以及fragment。*GL_ALWAYS*选型等同于不使用depth testing，其代表每个vertex都会被送入fragment，后面送入的更新前面送入的。
9. 我们最后实际使用的fragment depth是位于0-1之间的。它们首先从相机坐标系的z经过perspective projection映射到\[-1, 1\]之间，然后归一化到0-1之间。从相机系的真实depth转化到最后的0-1的depth，它们之间的关系满足反比。即

$$
z_{clip}  \propto \frac{1}{z_{view}}
$$

因此，当相机系中，object的depth离near plane较近时，微小的扰动会导致最终的depth变化较大，这样的好处就是，离near plane较近的object的depth能够被精确地区分开来，使得depth testing更准确。但是当相机系的depth value处于较大的范围时（离far plane近），depth即使变化很多，最终的depth变化很小，难以区分。总体而言，它们的关系满足下图：

![depth](/images/depth_rela.png)

10. 如果我们对最终存储的depth value进行一个visualization，会发现整个屏幕几乎是白色的。因为根据上面的depth transformation关系，由于大部分的object离near plane较为远（实际没有那么远，但是变换后值离1比较近），因此它们的depth都接近1。为了显示真实的depth，我们需要将它们转换为原来的相机系的depth。
11. **z-fighting**：由于空间中的objects的z-value较为接近，导致转换后的depth几乎一样，此时难以区分谁在前谁在后，就会导致z-fighting，效果如下：

![z-fighting](/images/z-fighting.png)

这种效应会在相机系的objects的depth较大的时候较为明显，因为此时depth的precision会较低，难以区分（看上面的曲线）。本质上来说，这是由于z-buffer的浮点数精度决定的，因为即使两个objects非常近，它们的实际depth也是不同的，只不过差异可能是$1e^{-100}$。当精度较低时，无法区分。

12. 解决z-fighting的三种方法：
    1. 尽量人为地使所有objects在相机系下，重合覆盖的部分减少。当重合部分减少时，z-fighting的区域也会减小。
    2. 设置near plane depth较大，因为离near plane越近的区域，其对depth的变化更敏感，我们越能够区分它们。但是这样的缺点是，depth较小区域的objects不可见。实际中，需要我们平衡优缺点，选择最为合适的near plane depth。
    3. 增大z-buffer的浮点数精度，以前的depth buffers精度为24-bit，modern GPUs支持32-bit depth buffer。

### Stencil testing
1. 作用：可以控制某些fragments的内容显示，某些不显示。可以实现的具体application有，画outline、画镜子等。
2. 全局效果：每个fragment先进行stencil test，若通过则进行depth test，否则未通过test，这个fragment的buffer中没有内容（全黑）；若通过stencil test，则再进行depth test，若通过则写入fragment buffers，否则fragment buffers中没有内容（全黑）。
3. 每个stencil buffer所占的空间为8 bit（因此最大可以设置的value=255）。

#### initialize
1. 启用：*glEnable(GL_STENCIL_TEST)*。打开stencil test，默认不打开，其效果就是不影响任何fragment buffer（颜色等各种attributes）的写入。
2. 每帧渲染前清空每个fragement的stencil buffer。默认清空都为0.。通过*Clear(GL_STENCIL_BUFFER_BIT)*实现。
3. 同depth test一样，我们可以控制stencil buffer是否能够写入。通过*glStencilMask(0xFF)*使得stencil buffer能够写入, *glStencilMask(0x00)*使得stencil buffer不能写入。默认为能够写入。

#### Stencil functions
1. *glStencilFunc(GLenum func, GLint ref, GLuint mask)*
   1. 作用：设定判断条件（func及ref），使得stencil buffer中的内容每次根据这个判断条件进行判断，若满足则pass，不满足则fail（fragment buffer无内容）。基本操作是每次判断stencil buffer中的内容与*ref*是否满足*func*的相互条件。而*mask*的作用是判断stencil buffer中的value与*ref*中的value的某些位是否满足*func*，具体来说，当*mask*=0xFF，代表*ref*和stencil buffer的8bit的所有bits进行比较，都满足*func*才判断pass，否则fail；同理*mask=0x01*代表只判断它们最低位是否满足*func*。
   2. *func*的option：*GL_NEVER, GL_LEQUAL, GL_GREATER, GL_GEQUAL, GL_EQUAL, GL_NOTEQUAL, GL_ALWAYS*。

2. *glStencilOp(Glenum sfail, GLenum dpfail, GLenum dppass)*
   1. 作用：*glStencilFunc*用于判断条件是否成立，而这个函数是在条件判断结束后，根据判断情况来对stencil buffer进行操作（写入或者保持等）。当满足条件时，写入stencil buffer中的值为*glStencilFunc*中的*ref*值（注意：能不能写入还要看*glStencilMask*的设置）。
   2. *sfail*指的是stencil test fail时所做的操作，*dpfail*指的是stencil test通过但是depth test fail时所做的操作，*dppass*指的是两者都pass时所做的操作。**默认都为GL_KEEP**。能有的选项为：*GL_KEEP, GL_ZERO, GL_REPLACE*等。
   3. 

### Blending
1. 概念：与透明度和图像的alpha通道有关。指的是显示的颜色是depth较小和depth较大的objects的颜色的融合。alpha=0指的是完全透明，alpha=1指的是完全不透明。
2. s

#### discard fragments
1. 对于读入的RGBA image，如果我们不做额外设置，GLSL不知道alpha通道是怎么用的（没有开启Blending）。以code中的grass为例，不做额外操作会使得alpha=0的区域全部为白色。因此我们要在fragment shader中discard掉alpha小于一定值的fragment。
2. 此外，由于我们默认设置texture的warping方式为repeat。因此若我们的texture coordinates取的是原texture的border区域（x=1.0左右或y=1.0左右），那么会进行插值，将repeat的image与原image进行插值，造成alpha通道不准确。因此我们需要设置warping方式为*GL_CLAMP_TO_EDGE*。否则效果如下

![error](/images/grass_error.png)

#### Blending
1. 做法：之前已经写入fragment buffer的color称为destination color，当前要写入的color称为source color。Blending就是对这两个color按照比例计算加权和。属于source color的权重称为source weight，属于destination color的权重称为destination weight，这两个weight的和一般为1。
2. 在启用Blending之前，我们需要enable。使用*glEnable(GL_BLEND)*。
3. **source color和destination color的取用，GLFW已经帮我们定义好了，因此我们只需要明确weight即可。**。weight的明确通过调用*glBlendFunc*实现。
4. *glBlendFunc(GLenum sfactor, GLenum dfactor)*
   1. 作用：设定source weight和destination weight。*sfactor*代表设定source weight，*dfactor*代表设定destination factor。
   2. 两个factor的一些选项：
      1. *GL_ZERO*：设置为0。
      2. *GL_ONE*：设置为1。
      3. *GL_SRC_COLOR*：设置factor为source color vector。
      4. *GL_ONE_MINUS_SRC_COLOR*：设置factor为1减去source color vector。
      5. *GL_DST_COLOR*：设置factor为destination color vector。
      6. *GL_ONE_MINUS_DST_COLOR*：设置factor为1减去destination color vector。
      7. *GL_SRC_ALPHA*：设置factor为source color vector中的alpha component
      8. *GL_ONE_MINUS_SRC_ALPHA*
      9. *GL_DST_ALPHA*
      10. *GL_ONE_MINUS_DST_ALPHA*
      11. *GL_CONSTANT_COLOR*：设定factor为constant color vector（自定义）
      12. *GL_ONE_MINUS_CONSTANT_COLOR*
      13. *GL_CONSTANT_ALPHA*
      14. *GL_ONE_MINUS_CONSTANT_ALPHA*
   3. 上面的constant color可以通过调用*glBlendColor*设置。  
5. *glBlendFuncSeparate(GLenum srgbfactor, GLenum drgbfactor, GLenum salphafactor, GLenum dalphafactor)*
   1. 作用：上面的function，一旦指定了factor，则source color和destination color的四维（RGBA）全部按照这个factor进行blending。我们也可以指定RGB以一定的factor blending，A以一定的factor blending。
   2. option同上面一样。
6. *glBlendEquation(GLenum mode)*
   1. 作用：用于设定source color和destination color的blending（乘上factor之后是加还是减等）方式（加、减、取max、取min）。
   2. *mode***默认为***GL_FUNC_ADD*。
      1. *GL_FUNC_ADD*：相加。
      2. *GL_FUNC_SUBTRACT*：source - destination。
      3. *GL_FUNC_REVERSE_SUBTRACT*：destination - source。
      4. *GL_MIN*：min（source，destination）。
      5. *GL_MAX*：max（source，destination）。

#### Rendering
1. 由于depth test的存在，会存在一些问题。假设当前我们已经draw了一个window，其depth较小。然后我们希望再draw一个window，其depth较大，且与之前那个window有重叠部分。虽然我们已经设定了blending的mode，但是由于depth test存在，其认为当前想要写入的color的depth大于之前depth buffer，因此不再写入fragment。这样造成的效果就是，在两个window的重合部分，fragment的color还是之前那个window的color，而不是blending的color。其效果如下：

![depth_tricky](/images/depth_tricky.png)

2. 解决上述问题的一个简单办法就是，先draw depth较大的object，再draw depth较小的object，那么就不会由于depth test，discard掉后续fragment color的blending。一个简单的做法就是记录每个object距离camera的distance，先画distance大的，再画distance小的。

### Face culling
**一般只对封闭的object使用，对于不封闭的不能enable**

1. 作用：在某些viewpoint下，我们只能看到某些faces，而不能看见所有的faces。但是OpenGL却会把所有的faces都渲染一遍（只是由于depth test而造成某些看不到的faces不能为我们所见，但实际上有渲染的过程）。这样会加大fragment shader的工作负担。我们其实可以省掉对这些看不见的faces的渲染，face culling就是起到这个作用。
2. 若不使用face culling，则所有我们draw的faces都会经过渲染过程。且由于每个face有两个side，不论我们从哪个side看这个face，OpenGL都会对其进行渲染，只不过texture进行了翻转而已。但是如果进行了face culling，则只要这个face在当前view下是顺时针的，那么它的所有顶点信息都不会被送入fragment buffer中，也就不用谈从哪个side去看这个face了。

#### Winding order
1. 当我们在定义顶点坐标时，针对每个三角形，可以以顺时针或者逆时针的顶点顺序去定义这个三角形。winding order指的就是我们定义的三角形顶点顺序。
2. OpenGL默认认为逆时针（counter-clockwise）（右手定则）定义的三角形是面对我们（normal朝向我们）的，顺时针是背对我们的。我们可以调用*glFrontFace()*来改变OpenGL所认为的面对我们的顶点顺序。*glFrontFace(GL_CCW)*指的是逆时针为面对我们（这是默认的），*glFrontFace(GL_CW)*指的是顺时针为面对我们的。
3. OpenGL会根据目前的相机位置，以及顶点的处理顺序来判断某个三角形到底是顺时针还是逆时针的（在我们的code中，由于我们的初始相机位置是面对逆时针的三角形，因此能够看到正面的三角形；而背面的三角形在当前camera view下看是顺时针的，所以不会参与渲染）。当我们将视角切换到cube的背面时，此时根据相机位置和三角形的顶点处理顺序，OpenGL可以判断出原本的背面（顺时针）在此时已经成为了正面（逆时针），因此将其渲染。

#### face culling
1. 若OpenGL判断出某个face在当前camera view下是顺时针的，则不会对那个face进行fragment 渲染，因而对其也就不会有后续的stencil test 和depth test。
2. 若要使用face culling，我们需要enable。可以调用*glEnable(GL_CULL_FACE)*。
3. OpenGL默认对朝向我们的face进行渲染，背对我们的不渲染，但是我们可以通过调用*glCullFace()*来改变渲染的face方向。*glCullFace(GL_FRONT)*代表不渲染面对我们的face，只渲染背对我们的face。

### Framebuffers
1. 概念：我们创建的所有buffers都被attach到默认创建的framebuffer（**buffer id为0**）上。但是我们也可以创建别的framebuffer进行off-screen rendering，然后将其数据送到这个默认的framebuffer上，进行on-screen渲染。**最终的数据都必须送到这个默认的framebuffer，才能够在屏幕上显示出来**。

#### creating a framebuffer
1. 创建
``` c
unsigned int fbo;
glGenFramebuffers(1, &fbo);
glBindFramebuffer(GL_FRAMEBUFFER, fbo);
glBindFramebuffer(GL_READ_FRAMEBUFFER, fbo); // attach到read buffer上，只读不能写
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, fbo); // attach到write buffer上，可以写
```
2. 需要满足的要求
   1. 至少attach一个buffer（color、depth、stencil）
   2. 至少有一个buffer内有数据
   3. 所有attachment必须complete
   4. 每个buffer必须有相同数量的样本
3. 检测上述要求是否满足

``` c
if(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE)
  // execute victory dance
```

4. 与前面一样，用完一个buffer object后，必须delete。调用*glDeleteFramebuffers(1, &fbo)*

#### Texture attachments
1. 作用：前面所用的各种buffer，如color、depth、stencil，都可以理解为存储在不同的image中（因为对于每个pixel都有它们的值），而这些image的存储格式都是相近的，都是renderobject format。由于它们都是类似image的样子，我们可以用texture object来替代它们，那么所有的color、depth、stencil结果（每个pixel）都会被存储在各自的texture中，我们可以直接将其视为一张texture image，送给fragment shader。用texture存储上面的量与之前不同的地方在于，存储的格式不同，之前的存储格式读取更快。

#### Renderbuffer object attachments
1. 概念：framebuffer存储着渲染一帧需要的所有buffers，renderbuffer也是其中一种buffer。
2. 作用：我们可以将color存储到texture中，然后attach到framebuffer上，texture的好处是其可以采样（readable），但是缺点是存储格式与OpenGL渲染过程中产生的buffer不同，也就是说，在渲染时需要将一些buffer中的内容进行存储格式转换，转换到texture中，这种额外的数据转换，会降低速度。对于depth、stencil这样的数据，我们并不需要readable，因为不需要对它们进行sample，取出它们的值用于别的用途。因此我们可以将它们存储到renderbuffer中，renderbuffer的好处是，其与OpenGL渲染过程中的buffer的数据存储结构相同，因此OpenGL在得到具体的值时，可以直接将这些值送给rendbuffer而不需要数据存储格式转换。但是其缺点是unreadable。因此我们只对一些不需要read（sample）的数据使用它，如depth、stencil，以加快速度。

#### Render to a texture
在实际使用时，我们先bind 自定义的framebuffer，然后进行off-screen rendering，将其数据都存储到自定义的framebuffer中。然后将framebuffer中的color以texture的形式送到framebuffer0中，在screen上进行渲染，这是通过画两个三角形填满屏幕实现的。由于我们的off-screen 渲染也是逐帧进行的，所以即使我们随时切换视角，都可以实时地进行off-screen渲染，然后送到framebuffer0中。

#### postprocessing
由于我们需要渲染的场景，现在已经变成了一张texture image，因此我们可以对这张image进行各种各样的image processing。比如使其变成gray scale image、用各种kernel对其进行操作（blur、sharp等）。

### Cubemaps
1. 方向问题：创建完一个cubemap后，它的中心就位于相机中心，其面的朝向与坐标轴的对应关系为：right -> +x; left -> -x; top -> +y; bottom -> -y; back -> -z; front（朝向我们的面） -> +z。因此若我们要取其texture，需要根据位于原点的坐标来索引。索引是通过定义一个向量实现的（不管长度，只取方向），值得注意的是这个向量既可以代表其pisition，也可以代表其direction，因为其从原点出发。这个向量延伸后，达到cubemap上哪个点就取哪个点的texture。

#### Creating a cubemap
1. bind a texture：*glBindTexture(GL_TEXTURE_CUBE_MAP, textureID)*。
2. 当我们定义好一个CUBEMAP后，其六个面的索引是确定的。

   GL_TEXTURE_CUBE_MAP_POSITIVE_X	Right
   GL_TEXTURE_CUBE_MAP_NEGATIVE_X	Left
   GL_TEXTURE_CUBE_MAP_POSITIVE_Y	Top
   GL_TEXTURE_CUBE_MAP_NEGATIVE_Y	Bottom
   GL_TEXTURE_CUBE_MAP_POSITIVE_Z	Back
   GL_TEXTURE_CUBE_MAP_NEGATIVE_Z	Front

   且从上到下的顺序也是确定的（同texture units），即
   GL_TEXTURE_CUBE_MAP_POSITIVE_X + 1 = GL_TEXTURE_CUBE_MAP_NEGATIVE_X
   GL_TEXTURE_CUBE_MAP_POSITIVE_X + 2 = GL_TEXTURE_CUBE_MAP_POSITIVE_Y
3. 设定warping和filtering：*glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S\[T, R\], GL_CLAMP_TO_EDGE)*。注意，在texture中，x、y、z坐标分别为s、t、r。对cubemap，wraping方式一般选择*CLAMP_TO_EDGE*。

#### An optimization
1. 原因：如果我们先画cubemap，再画objects，意味着每个fragments都能通过cubemap的depth test，将cubemap的内容写入fragment进行渲染。但是在后续画objects的时候，许多fragments又会被objects所覆盖，造成前面画cubemap的那部分算力浪费。因此我们选择在objects都画完时再画cubemap。
2. 难点：我们最后画cubemap时，要确保cubemap的depth总是最大，即其不会覆盖任何objects的内容，因此我们需要将cubemap所有vertices的depth都设置为1，然后将depth test的判断条件设置为*GL_LEQUAL*，这是为了覆盖那些不含有任何内容的fragments，因为在初始化时，所有fragments的depth都被设置为1。
3. 解决方法：vertex shader中已经完成了MVP变换，最终的四维坐标只要根据w component进行division即可得到clip坐标（x、y、z，x、y代表平面坐标，z代表深度）。因此我们只需要将z component设置为w，那么在division后，它的z component就为1，自然而然完成了将其深度设置为1的目标。

### Advanced Data

#### pour data in buffers
1. 之前我们都是用*glBufferData*将data数据送入buffer，若我们给定了data数据的指针，则就会直接把数据送入buffer，但是若我们只给一个NULL，就会根据data的size allocate一块memory用于后续使用。
2. *glBufferData*没办法根据我们的需要，对buffer中特定存储区域的内容进行修改，但是*glBufferSubData*可以。其可以根据从 buffer首元素位置的offset加上要修改数据的大小（即对\[offset, offset + datasize\]），对这些区域的memory进行修改。**注意：在调用subdata时必须已经调用过bufferdata（可以是NULL，也可以已经有数据），因为其可以向os申请一块区域的内存，而subdata无法申请内存。**
3. 除了直接用*glBufferData*，我们也可以调用buffer的指针，利用指针对其进行操作。

```c
float data[] = {
  0.5f, 1.0f, -0.35f
  [...]
};
glBindBuffer(GL_ARRAY_BUFFER, buffer);
// get pointer
void *ptr = glMapBuffer(GL_ARRAY_BUFFER, GL_WRITE_ONLY);
// now copy data into memory
memcpy(ptr, data, sizeof(data));
// make sure to tell OpenGL we're done with the pointer
glUnmapBuffer(GL_ARRAY_BUFFER); // 释放指针
```

#### Batching vertex attributes
1. 之前的data组织形式都是按照每个vertex的所有attributes连着放一起，一个vertex一个vertex往下组织。实际使用是可能存在这样的情况：分别有一个array存着position，一个存着texcoordinate，一个存着normal。要将它们都放入buffer需要额外的存储方式，需要调用*glBufferSubData*。
2. 利用*glBufferSubData*，可以按照offset将position、normal等各自放一起。那么在明确buffer的attribute pointer时，就可以不像之前一样，每个数据单元都包含了所有的attri。

```c
float positions[] = { ... };
float normals[] = { ... };
float tex[] = { ... };
// fill buffer
glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(positions), &positions);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions), sizeof(normals), &normals);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions) + sizeof(normals), sizeof(tex), &tex);

glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), 0);  
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)(sizeof(positions)));  
glVertexAttribPointer(
  2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)(sizeof(positions) + sizeof(normals)));
```

#### Copying buffers
1. 如果我们想要将一种类型buffer的data copy到另一个类型的buffer，可以分别bind，进行copy。但是如果我们想copy一个array buffer的data到另一个array buffer，我们无法同时bind两个同种类型的buffer，此时需要用到额外的buffer type。
2. *GL_COPY_READ_BUFFER*和*GL_COPY_WRITE_BUFFER*是两种可以用于这种目的的buffer。此外，我们可以用*glCopyBufferSubData*对buffer data进行copy。

```c
glBindBuffer(GL_COPY_READ_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 8 * sizeof(float));
```
或者只用一种别的类型的buffer
```c
float vertexData[] = { ... };
glBindBuffer(GL_ARRAY_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_ARRAY_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 8 * sizeof(float));
```

3. *void glCopyBufferSubData(GLenum readtarget, GLenum writetarget, GLintptr readoffset,
                        GLintptr writeoffset, GLsizeiptr size);*

### Advanced GLSL

#### GLSL's built-in variables
1. Vertex shader variables
   1. *gl_PointSize*：默认不可以进行手动设置，通过调用*glEnable(GL_PROGRAM_POINT_SIZE)*可以进行后续手动设置。
   2. *gl_VertexID()*：其存储着我们当前drawing的vertex的ID。当使用*glDrawElements*画primitives时，这个变量存储着当前我们正在画的vertex的索引；当使用*glDrawArrays*时，这个变量存储着当前已经处理完的vertex的数量（因为按照顺序画vertex，所以不需要记索引，当前的数量即是索引）。
2. Fragment shader variables
   1. *gl_FragCoord*：其x、y已经存储着screen space的坐标。根据我们设置的*gl_Viewport*，其已经完成了从NDC到screen space的转换，我们设置的viewport为800*600，因此其存储着从window左下角开始的screen space坐标。而其z坐标存储着fragment的depth，其已经完成从NDC的\[-1, 1\]到\[0, 1\]的变换。这是一个read-only variable。
   2. *gl_FrontFacing*：其是一个bool变量，存储着当前fragment是否属于某个frontfacing face或者是backfacing face。如果我们enable face culling，则这个变量对我们来说没有什么实际的作用，但是如果我们不enable，那么我们可以利用这个bool变量，来设置inner face和outer face的texture，使它们用不同的texture。
   3. *gl_FragDepth*：存储着当前fragment的depth，其是一个writable variable。如果我们没有写入，它会自动读取*gl_FragCoord.z*作为其value。如果我们手动设置其值，一个缺点是OpengGL无法进行early depth tesing，因为那是在进入fragment shader之前做的，其无法预知在fragment shader中是否会手动设置depth。

#### Interface blocks
1. 之前在shader之间交换variables时，我们都是一个变量一个变量的交换。除此之外，我们还可以交换类似结构体一样的变量，它可以将多个变量组织在一起，这个类似结构体的东西就叫做*Interface blocks*。

``` c
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out VS_OUT
{
    vec2 TexCoords;
} vs_out;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);    
    vs_out.TexCoords = aTexCoords;
}  
```

``` c
#version 330 core
out vec4 FragColor;

in VS_OUT
{
    vec2 TexCoords;
} fs_in;

uniform sampler2D texture;

void main()
{             
    FragColor = texture(texture, fs_in.TexCoords);   
} 
```

#### Uniform buffer objects
1. 作用：可以发现，之前在定义多个shader programs时，类似view matrix和projection matrix这些uniform objects，我们都需要为每个program去设置它们，比较麻烦。实际的opengl project中，programs的个数可能有成百上千个，因此为每个program都设置相同的uniform变量是极其低效的。这可以通过uniform buffer objects解决。
2. **uniform block**：存在buffer object中的内容，即其是一块存有数据的memory。以下是一个存在于shader中的uniform block的示例：

``` c
layout (std140) uniform ExampleBlock
{
    float value;
    vec3  vector;
    mat4  matrix;
    float values[3];
    bool  boolean;
    int   integer;
};
```
   1. 有了一块memory后，我们需要告诉OpenGL，这块memory中的数据组织形式（offset、length等）。OpenGL可以知道其中的每个variable的bytes大小（float、bool、int等），但是其不知道在这个block中，相邻的variable之间的space（不存在数据的memory单元）。因为硬件可能由于内存单元的对齐方式，自动排列variables（以填充memory达到内存对齐），这导致我们无法知道整个block中，不同的variables具体存放在哪个地方（即不知道offset是多少）。
   2. GLSL默认使用*shared layout*，一旦硬件经过优化，确定了block中各个variable的offset，这些offset就会被所有program所共享。硬件知道这种offset，因此我们可以通过调用*glGetUniformIndices*来获得variables的offsets，但是在这章不使用这个方法。由于我们并不知道硬件是怎么优化的，即我们不知道具体的offsets，所以我们无法手动设置各个variable的值。这种layout方式的优点在于节省内存。
   3. 由于*shared layout*方式无法得知具体的offsets，因此我们将使用*std140 layout*方式。其区别就在于，这种layout方式采取内存对齐方式，每个variable都占有16 bytes的内存（占不满就空着），这样就可以知道所有variable的偏移量（都是16的倍数）。注意：matrix在内存中是以列优先方式排列，因此其是4个16 bytes数据的集合，故一个matrix占有64个bytes。

   ``` c
   layout (std140) uniform ExampleBlock
   {
                     // base alignment  // aligned offset
    float value;     // 4               // 0 
    vec3 vector;     // 16              // 16  (offset must be multiple of 16 so 4->16)
    mat4 matrix;     // 16              // 32  (column 0)
                     // 16              // 48  (column 1)
                     // 16              // 64  (column 2)
                     // 16              // 80  (column 3)
    float values[3]; // 16              // 96  (values[0])
                     // 16              // 112 (values[1])
                     // 16              // 128 (values[2])
    bool boolean;    // 4               // 144
    int integer;     // 4               // 148
   }; 
   ```

   4. 还有一种*packed layout*方式，其无法保证每个program中对于一个block的offsets是相同的（shared）。
3. *Binding point*：可以把uniform buffer objects bind到上面，以供后续调用，有点像texture units，这样我们就可以同时调用多个uniform buffer object。在设定binding point时，我们不仅需要把定义的uniform buffer object bind到某一个binding point，还需要把shader中申明的uniform buffer object bind到同一个binding point上。

### Geometry Shader
1. 作用：可以对从vertex shader输出的顶点进行几何上的加工。
2. GLSL

``` c
#version 330 core
// in的类型要对应我们在render loop中指定的primitives type(GL_Draw_Arrays)。
// points lines : GL_POINTS
// lines : GL_LINES GL_LINE_STRIP
// lines_adjacency : GL_LINES_ADJACENCY GL_LINE_STRIP_ADJACENCY
// triangles: GL_TRIANGLES GL_TRIANGLE_STRIP GL_TRIANGLE_FAN
// triangles_adjacency : GL_TRIANGLE_ADJACENCY GL_TRIANGLE_STRIP_ADJACENCY
layout (points) in; 
// out的类型只有 points line_strip triangle_strip 且可以通过指定max_vertices来指定最多要画的顶点数量
layout (line_strip, max_vertices = 2) out; 

void main() {    
    // 取出当前primitive的第一个顶点，由于我们的primitive是point，所以只需要取第一个顶点
    gl_Position = gl_in[0].gl_Position + vec4(-0.1, 0.0, 0.0, 0.0);
    EmitVertex(); // 画点（每次emit都会画出一个点，因此我们可以根据自己的需要在原来的点的基础上画多个点）

    gl_Position = gl_in[0].gl_Position + vec4( 0.1, 0.0, 0.0, 0.0);
    EmitVertex(); // 画点

    // 这里对同一个送入geometry shader的点，进行了两次位置改变，并进行emit。这代表，我们在原来的点的基础上多画了两个点。
    
    EndPrimitive(); // 根据指定的输出primitive type和刚才画的点，画出primitive。
} 
```

3. 对于从vertex shader中接收的内容，Geometry shader中对其数据结构的组织形式如下。**geometry shader每次从vertex shader中接收画一个primitive的所有顶点信息，这些顶点信息就被存储在gl_in数组中**

``` c
in gl_Vertex
{
    vec4  gl_Position;
    float gl_PointSize;
    float gl_ClipDistance[];
} gl_in[];  // 每个primitive都有这么一个数组
```

4. 其定义什么的都与vertex、fragment shader相同。可以用已经写好的shader header。

#### Let's build houses
1. 由于三角形的特殊性，我们只要有N个顶点，就能够画出N-2个三角形。
2. geometry shader中画*triangle_strip*，是根据画顶点的先后顺序去画三角形的，一旦画完第一个三角形的三个顶点，后续再画一个顶点，其就会与最近画的两个顶点组成另一个三角形。

#### Exploding objects
1. **注意：本来想的是，似乎geometry shader做的事情，vertex shader也能做，于是想要试着在vertex shader中进行。但是开始写才发现，顶点都是一个个进入vertex shader的，它们不知道当前顶点与其它顶点的关系，即不知道primitives关系，因此就无法算normal。而geometry shader的一次输入是一个primitive的所有顶点，故可以算normal。除去normal的影响（若我们在vertex shader中已知normal），我们也可以在vertex shader中对每个顶点的位置进行改变**

#### Visualizing normal vectors
1. 作用：如果我们在进行PBR后，发现光照不太对，很有可能是normal出错了，为了检验normal是否正确，最好的办法是对其进行visualizing。

### Instancing
1. 作用：如果我们要反复画一组顶点（只是MVP不同），之前的做法就是多次调用*glDrawArray*。但是若我们要画成百上千个这种重复的pattern，多次调用*glDrawArray*时。在每次调用函数时，CPU与GPU都需要进行通信，明确buffer位置等内容，这极大降低了渲染效率。而instancing（每个要画的内容称为一个instance）可以只调用一个函数就画重复的pattern，大大降低了通信的频率。
2. 当我们不再用*glDrawArray*画primitives时，而是用*glDrawArraysInstanced(GL_TRIANGLES, 0, 6, 100)*后（100代表要画100个instance）。在vertex shader中，有一个built-in variable *gl_InstanceID*，其反应了当前处理的vertex属于哪个instance。
3. 我们可以在vertex shader中定义一个uniform变量，存储着每个instance需要的信息，然后调用instanceID获得这个信息。但是如果我们的instance数量非常大，uniform variable会达到其存储上限（shader中的uniform变量的数量有上限），这就使得我们必须使用*Instanced arrays*来实现。

#### Instanced arrays
1. 与以前画primitives相同的地方就在于，每个instance需要的信息都存在VAO中，然后通过定义pointer来获取。不同点在于，以前定义的attibutes都是每个顶点都有一个attributes（position、TexCoords、normal等），因此在vertex shader中指明了layout后，每次从VAO中读取数据都会读取每个顶点的所有数据。但是由于一个instance含有多个顶点，若我们对一个instance的操作都是平移，那么对每个顶点存储一样的平移向量是不合理的，因此instance arrays能够使得我们在只存储一个instance共用的信息的前提下，给每个vertex都传送这个信息。
2. 使用：

``` c
#version 330 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aOffset;

out vec3 fColor;

void main()
{
    gl_Position = vec4(aPos + aOffset, 0.0, 1.0);
    fColor = aColor;
}  


unsigned int instanceVBO;
glGenBuffers(1, &instanceVBO);
glBindBuffer(GL_ARRAY_BUFFER, instanceVBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec2) * 100, &translations[0], GL_STATIC_DRAW);
glBindBuffer(GL_ARRAY_BUFFER, 0); 


glEnableVertexAttribArray(2);
glBindBuffer(GL_ARRAY_BUFFER, instanceVBO);
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)0);
glBindBuffer(GL_ARRAY_BUFFER, 0);	
glVertexAttribDivisor(2, 1); 
```

唯一不同的地方就在于多了*glVertexAttribDivisor(2, 1);*这个函数，其第一个参数指的是使哪一个layout属性称为instance arrays，第二个参数指的是每几个instance才更新一下*aOffset*的值。由于每个instance含有多个vertices，但是vertex shader每次只处理一个vertex，因此需要指明当前进入vertex shader的顶点属于哪一个instance，这通过*gl_InstanceID*指明。vertex shader默认对每个进入其中的vertex，都更新（取下一个值）所有layout指明的属性，但是因为我们在这里设置了更新的step，其意思就是，每次vertex shader查看进入的vertex的instace ID，判断其是否属于一个新的instance，若不是则再取同样的aOffset值，若是新的instance，则更新aOffset的值。这样就使得同一个instance的多个顶点可以共享一个attibute。

### Anti Aliasing
1. 一些概念
   1. super sample anti-aliasing（SSAA）：在高分辨率下进行渲染，然后downsample，这样可以减少aliasing。
   2. multi-sample anti-aliasing（MSAA）：在每个fragment（pixel）内采样多个subsamples，若有一半的subsamples位于三角形内，那么就判断这个pixel属于这个三角形。其颜色为pixel中心位置插值颜色，乘上位于三角形内部的subsamples的比例。
2. MSAA默认在一些驱动中是打开的，但是不是所有的驱动下都是打开的，因此我们最好设置一下，保证一定使用。

``` c
glfwWindowHint(GLFW_SAMPLES, 4); // 使用subsamples的数量为4
glEnable(GL_MULTISAMPLE); // 打开MSAA
```

3. 在MSAA中，由于每个pixel有多个subsamples，因此在进行depth test和stencil test时，默认会为每个subsamples创造一个depth buffer和stencil buffer，那么就会对每个subsamples进行depth和stencil test，可能的情况就是，1个subsample来自于一个triangle，另外三个subsamples来自于另外一个triangle，此时会根据占比选择属于哪个三角形。即使fragment shader对每个fragment只做一次渲染，但是每个pixel中心的颜色值被渲染出来后，每个subsample都会根据插值获得一个color，因此每个subsample也会有一个color buffer。这样来说，也就意味着，如果我们使用了MSAA，framebuffer的存储量会比原来大n倍，这个n指的就是每个pixel中subsample的数量。
4. 除了使用2中默认的方式，我们也可以利用frame-buffer实现off-screen rendering。但是由于我们渲染出来的color、depth、stencil buffer不是常规的buffer（4倍于screen resolution），因此我们不能直接以这个color buffer作为texture map进行sample。通常采用的做法是对buffer进行copy，在framebuffer那一chapter中，指明了有read buffer、write buffer，可以对buffer进行copy。在这里，我们可以将已经渲染的4被buffer放入read buffer，将default frame buffer（id=0）放入write buffer，然后利用*glBlitFrameBuffer*将read buffer中的buffer downsample后放入write buffer。
5. 使用4中的方式并不能对渲染的结果进行post-processing（灰度化、sharpen等），因此我们可以将再使用一个intermediate frame buffer，用其存放正常resolution的buffer，即用其作为正常的texture map，然后在default frame buffer对其采样时进行post-processing。

## Advanced lighting

### Advanced Lighting
1. Blin-Phong：Phong model的specular分量算的是view direction和specular reflection之间的角度。由于view direction可以是任意的，因此可能存在它们之间的夹角大于90 degrees的情况，这时算出来的dot就是负的。如果shiness的值比较小，那么算出来的power值会比较大，这导致specular分量绝对值比较大，将其加到ambient和diffuse分量上后会导致整体的lighting为0，甚至为0。这样渲染出来的效果是不合理的。Blin-Phong model对phong model的改进在于，从算view direction和reflection改为算normal和half vector（reflection和light的half）的dot。这样一来就不存在角度大于90 degrees的情况。
2. 虽然Blin-Phong改进了角度问题，但是由于角度在half领域内算dot，可以想象角度减小了一半，dot相应也会减小。为了能够产生与Phong model一样的效果，需要将shiness相比于原来提高2-4倍。实际中，可以手动调整shiness直到遇Phong model效果一样。

### Gamma Correction
1. 我们一般做PBR等都在linear space，这些做完渲染后的值，将会被送往显示器显示。它们作为显示器每个pixel的输入电压，根据gamma=2.2的decode后变为显示器显示的颜色值。可以发现，linear space中相差两倍的颜色value，在经过显示器decode之后的颜色值并不相差两倍，即亮度值与linear space的value值不成正比。为了使得显示时候的亮度值与linear space的值成正比，我们首先需要对linear space的color value进行gamma=1/2.2的encode（这个space称为sRGB space，也就是我们通常存储的颜色space），那么在进行显示器的decode时，就能使得在linear space中value相差两倍的颜色，在显示器显示时亮度也相差两倍。这种encode、decode本质上就是为了将linear space上成比例的value值（对显示器来说是成比例的电压值），在经过电压-颜色转换后，成为在转换后的颜色域中成比例的value值。
2. OpenGL中使用gamma correction的方式
   1. built-in方式
   ``` c
   glEnable(GL_FRAMEBUFFER_SRGB); // 开启这个后，所有写到color buffer中的值都是在sRGB space的
   ```
   2. 在fragment shader中，手动对做完PBR的color值算一个1/2.2的power。若有多个programs，可以选择在rendering loop中做gamma correction。
3. OpenGL中使用gamma correction的注意点
   1. 必须在最终要显示的时候才使用gamma correction。例如，如果我们使用额外的framebuffer渲染一个scene，然后作为texture输入default framebuffer。如果在进行off-screen渲染时，我们就已经将存储的texture map转换到sRGB space，那么我们在default framebuffer中继续以这个texture做后续的计算时，就会出现错误。正确的做法是，所有的中间计算都在linear space做，只有最终要送往显示器显示时才进行gamma correction。
   2. 一般的diffuse texture map是位于sRGB space的，specular maps和normal maps通常是位于linear space的。因此当我们读取这些image作为texture maps时，我们要注意它们的color space。我们所有的操作都是在linear space进行的，如果对于sRGB texture我们不把它转换为linear space，那么在最终送往显示器时再做一次gamma correction就会导致结果不正确。因此任何送入opengl中的color都必须位于linear space。我们可以手动对color进行gamma=2.2的correction将其转换为linear space。也可以使用opengl的built-in方式。
   ``` c
   // 通过指定GL_SRGB，OpenGL知道其位于sRGB space，因而会自动对其进行gamma=2.2的correction使其位于linear space。
   // 若是含有alpha通道的image，可以指定GL_SRGB_ALPHA。
   glTexImage2D(GL_TEXTURE_2D, 0, GL_SRGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);  
   ```
   3. 之前在计算point light的distance attenuation时，正确的attenuation关系是二次方反比。但是如果我们的light intensity位于linear space，那么对其算平方反比进而进行PBR渲染并做gamma correction后，得到的结果会是$(1.0/distance^2)^{2.2}$，这并不符合视觉效果。而如果用的是一次反比，结果是$(1.0/distance)^{2.2}$，反而是真实的平方反比。因此，如果light intensity位于linear space，我们不能简单的用平方反比，而是根据gamma值折算这个attenuation系数。
4. 在chapter末尾有许多关于gamma correction的resources可供进一步参考。

### Shadow mapping
1. shadow的model其实就是看在light处能否看到某一个point，也即在light处放一个orthographic camera，然后渲染一个depth map。当我们正常渲染场景时，fragment shader中会记录当前fragment内容的3D坐标，我们将这个坐标转换到light坐标系下，并进行rasterization，得到其在light depth map中所属的fragment。然后将depth map与这个点的depth比较即可得到其visibility。

#### The depth map
1. 为了在light处渲染一个depth map，我们需要另外一个framebuffer，且用framebuffer渲染得到depth map后，将其作为texture map读到fragement shader中用于depth的比较。
2. 由于我们只需要得到depth map，而不需要渲染color buffer。可以通过调用*glDrawBuffer(GL_NONE)*和*glReadBuffer(GL_NONE)*，使得不对color buffer进行渲染。

#### Light space transform
1. 在使用directional light时，渲染其depth map必须用orthographic camera。

#### Shadow acne
1. 使用上述方法渲染出来的图像会有条纹，其源于depth map的resolution有限以及lightdir与surface存在夹角（导致depth map与surface存在夹角）。这可以通过给depth加一个bias解决。

#### Peter panning
1. 当bias过大时，会导致depth出现失真，因此需要用face culling解决。

#### Over sampling
1. 渲染的场景中，有大块地板的区域是暗的。有以下两点原因：
   1. 渲染directional light的depth map时，由于image plane的大小是有限的，因此其视锥无法看到场景的所有内容。那么当视锥外的point投影到depth map平面时，其位于texture map外面。由于我们之前使用的texture warping方式是repeat，因此会出现不正确的shadow。
   2. 渲染depth map时的near和far plane的depth是指定的，那么对于depth大于far plane的object，其最终的depth始终大于1.0，那么其就会始终位于shadow中。
2. 解决第一点的方法：我们可以设置texture warping方式是clamp_to_border，然后将border的depth值设置为1。那么当视锥外的point与texture的depth比较时，其就会始终大于texture的depth，即不位于shadow中。
3. 解决第二点的方法：解决第一点的方法无法解决第二点，因为其point的depth始终大于1.0。因此我们可以手动设置，当point位于far plane后面时，其shadow直接为0.0，即没有shadow。这可以通过比较point的z坐标和1.0来实现。

#### PCF（percentage-closer-filtering）
1. 即使采取了上述两种方法，我们会发现，在阴影的边缘处会存在锯齿（jagged blocky edges）。这是由于以下两点原因：
   1. 在渲染depth map时，depth map的分辨率有限，那么就跟常规渲染一样，其会在objects的边缘部分产生aliasing（这是由rasterization决定的，只能缓解，不能克服）。即depth map存在aliasing。那么在对depth map进行采样时，这种aliasing必然也会被采样到，造成阴影的aliasing。
   2. 由于depth map的分辨率有限，渲染阴影时多个fragments可能被投影到同一个texel内，造成这种aliasing（假设depth map的分辨率足够大，以致于每个fragments都能对应一个texel，那么当texel不存在aliasing时，fragments也必然会很平滑。但是由于texture map也存在aliasing，从本质上来说，只要我们zoom in足够近，都能看到aliasing）。
2. 解决方法：对于aliasing，通常的做法都是做平滑（卷积）。可以通过取每个fragment投影后的位置的周围texel的值做平均来解决，其本质上就是sample问题，需要做一些interpolation。这就能够在depth map本身就存在aliasing的基础上，能削弱其影响。

### Point Shadows
last chapter用的是directional light，因此其用的是orthographic projection，并且只需要渲染light方向的depth map即可。但是point light会向四面八方辐射能量，因此需要记录其所有方向的depth值，这就需要一个cubemap来存储depth值

#### Generating the depth cubemap
1. 需要对cubemap逐个面attach一张2D image（NULL）。

#### Light space transform
1. 用一个vector变量存储所有6个faces的transform matrix。**值得注意的是，这里用的是perspective matrix。而为了能够渲染到所有的场景，其FOV为90 degrees**。

#### Depth Shaders
1. 一个cubemap有6个faces，每个face需要用到不同的transform matrices，如果对每个face都单独draw一下，开销会比较大（决定因素有很多，如显卡等。实际使用中，若要求效率最大化，可以都尝试一下，选择更好的）。为了解决这个问题，我们可以借助geometry shader。每当一个primitive进入geometry shader后，我们可以将它同时渲染到6个faces上，这就避免了每次draw时，需要对同一个primitive进行渲染。
2. geometry shader中有一个built-in variable *gl_Layer*，其指定了当前需要进行渲染的cube face的id（只有在当前framebuffer上bind了一个active的cubemap后，它才有意义）。我们可以循环设定其为0-5，那么就可以将当前primitive渲染到6个faces上。
3. 这里我们直接自己计算线性的depth（用point到point light的distance除以far depth），而不用perspective projection决定的depth。

#### Omnidirectional shadow maps
1. 在对depth map和当前渲染fragment的depth进行比较时，可以直接拿当前fragment到lightPos的距离与之比。因为我们之间是将depth map的值除以far plane depth得到，因此可以将其乘回来与当前fragment进行比较。
2. 在比较时，为了避免shadow acne，我们也需要加上一个bias。

#### PCF
1. 上一章用的PCF是对depth map上的相邻pixels进行采样求平均，这种采样可能导致采样的direction非常相近，其depth值几乎没有变化，因此，为了使得效果更好，可能需要加大采样的范围，取step_size为2甚至3。这就会导致采样过多，开销较大。为了达到采样数量少且效果也好的目的，我们可以自定义一些direction而不是在texture上取pixels，通过在原direction vector上加上这些directions，就可以在cubemap上进行采样。下面的diskRadius可以控制采样的direction偏离原direction的程度。

```c
vec3 sampleOffsetDirections[20] = vec3[]
(
   vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1), 
   vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
   vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
   vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
   vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
); 


float shadow = 0.0;
float bias   = 0.15;
int samples  = 20;
float viewDistance = length(viewPos - fragPos);
float diskRadius = 0.05;
for(int i = 0; i < samples; ++i)
{
    float closestDepth = texture(depthMap, fragToLight + sampleOffsetDirections[i] * diskRadius).r;
    closestDepth *= far_plane;   // undo mapping [0;1]
    if(currentDepth - bias > closestDepth)
        shadow += 1.0;
}
shadow /= float(samples);  
```
2. 由于diskRadius可以控制采样的范围，因此我们可以通过控制其大小来控制shadow的soft-sharp程度。我们可以实现当viewdistance较远时看起来softer（本来也就看不清细节），较近时看起来sharper。这是通过控制diskRadius与viewdistance成正比实现的。

#### Normal mapping
由于normal的存在，做渲染时才能得到更加realistic的结果。

#### Normal mapping
1. 一般将normal存成0-1的rgb image，在使用时需要转回\[-1, 1\]。
2. 由于一般的normal texture map中，normal的指向都朝positive z轴，而我们会讲我们的geometry做各种变换，那么将这个normal mapping到geometry某个surface上时，就会造成normal方向与实际surface朝向不同的问题。这就是normal mapping要做的事情。

#### Tangent space
1. **Tangent space**：以某个surface的normal为z轴，x、y轴根据需要确定的坐标系。
2. **TBN matrix**：Tangent、Bitangent、Normal。能够将tangent space与其它坐标系之间的value进行转换。
3. 可以利用线性方程解出TBN matrix中的三个正交向量

#### Tangent space normal mapping
1. 在计算PBR时，有两种space的方案：
   1. 将所有vector都转到tangent space
   2. 将所有vector都转到world space
2. 实际中最好采用上面的第一种方案：因为第一种方案可以在vertex shader中做完所有的坐标转换，而不需要到fragment中做，这样可以节省fragment的开销（vertex shader和fragment shader是并行运行的，vertex shader每次只需要处理一个vertex，而fragment shader需要处理所有的fragment/pixel，因此fragment shader要处理的数据量大于vertex shader（fragment number > vertex number），导致vertex shader较为空闲）。

#### Complex objects
1. 用*Assimp*读取obj格式的mesh时，其提供自动计算Tangent和Bitangent vectors的方式，然后我们可以用cross得到normal。

#### Re-orthogonalize the TBN matrix
1. 当mesh含有非常多的vertices时，为了整体的smooth效果，tangent vectors的计算可能会为了smooth而做一些average，这将导致TBN三个vectors可能non-orthogonal，我们可以重新使得它们正交。

``` c
vec3 T = normalize(vec3(model * vec4(aTangent, 0.0)));
vec3 N = normalize(vec3(model * vec4(aNormal, 0.0)));
// re-orthogonalize T with respect to N
T = normalize(T - dot(T, N) * N); // 这个T与N计算点乘结果为0，即正交。
// then retrieve perpendicular vector B with the cross product of T and N
vec3 B = cross(N, T);

mat3 TBN = mat3(T, B, N) 
```

### Parallax Mapping
1. 作用：与normal mapping一样，都是为了增强realistic的效果，使得object产生深度不同的效果（单纯采样diffuse map不会有深度）。
2. 简单做法：在displacement texture map上采样，然后采样值加到vertices坐标上，产生效果。虽然这样能起到视觉效果，但是这样做的缺点在于，只有在vertices数量足够多（faces数量足够多时）时，逐个顶点的坐标改动，才能产生realistic的效果，否则会很差，这样的开销会很大。
3. 想象一下，在一张2D image上，如果想要产生深度的视觉效果，必然是让深度小与深度大的surface之间有过渡带，这个过渡带越长，视觉上的深度差异就会越大。因此parallax mapping就是利用了这样的视觉感知特点，产生过渡带。
4. 其通过视角方向，使得原本应该看到的diffuse map上的点取其它点的texture坐标，进而产生过渡带效果。**为了能够取到这个不同的texture坐标，需要在tangent space算，这样才能使得view direction的x、y坐标与surface align，进而用其x、y坐标取texture坐标**

#### Parallax mapping
1. 之前解释用的是height map，实际中使用的是depth map，其可以通过渲染前对height map取逆，得到一张depth map；也可以在渲染时，用1-height map的值作为depth map。
2. **Parallax Mapping with Offset Limiting**：之前的解释仅仅只是取，在tangent space下的view direction的x、y坐标作为texture的offset。而该technique，是在xy坐标的基础上除以z坐标。由于在tangent space，因此view direction的z坐标必定是正的且位于0-1之间（因为做了normalization），因此以x、y坐标除以z坐标，可以起到，当view direction与normal的夹角比较大时（与surface趋于平行时），z坐标比较小，而view direction的length因此较大，因此offset比较大。**角度越大本来就是要offset越大，才能符合之前的解释，只不过一开始固定了offset而已，这里以此做scale能产生更为realistic的结果**
3. 这种方法在view direction与surface normal的夹角非常大时，会出现问题。因为视觉效果的产生，是过渡带导致的，如果我们在offset之后的所有采样到的texture内容都是一样的，那么就不存在过渡带。只有能够平滑过渡采样到示例中的瓷砖中的缝隙，用这个缝隙产生过渡带才能有这样的视觉效果。在角度比较大时，会导致无法平滑采样过渡带，而只能有很少的fragment采样到缝隙的结果，这样就会导致深度消失（因为过渡带越长，深度越明显）。

#### Steep Parallax Mapping
**如果就像示例那样画的，我们能够沿着视角方向看到与geometry的hit point的话，那么这些都是严格正确的。但是由于我们没有显式的geometry，因此无法计算确切的hit point，故所有的hit point都是粗略估计的，这才会导致我们的粗略估计在视角比较大时效果很差。所有改善这些的方法，从本质上来说就是估计更准确的hit point**
1. 这是为了解决无法平滑采样过渡带的问题。当使用采样点时，可以做到尽量多采样一些连续的过渡带点。当采样点越多时，过渡带会越平滑，这也意味着开销加大。
2. 可以使得采样点随着角度的加大而增多，使其在角度越大的时候越平滑。

#### Parallax Occlusion Mapping
1. 对上面的方法，在刚好得到想要的sample点和前一个点之间做插值，使得得到的点更接近实际应该看到的点。

### HDR
1. 如果我们的color value值大于1.0（HDR），那么当其被写入framebuffer时，其会被自动clamp到0-1之间，造成许多细节的损失。为了解决这个问题，我们需要进行tone-mapping，将HDR转换为LDR。
2. 如果要使用off-screen rendering，为了防止value写入framebuffer时自动被clamp，我们可以将其color attachment设置为*GL_RGBA16F*，即floating point framebuffers。然后将其值作为texture map，读进default framebuffer（**其color buffer默认为8bit而不是floating point**）。

``` c
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL); 
// 支持的有GL_RGB16F、GL_RGBA16F、GL_RGB32F、GL_RGBA32F 
```
3. 尽管我们存的texture map是HDR的，但是我们直接采样写入default framebuffer，其还是会被直接clamp，因此我们需要在写入之前进行tone mapping。比较简单的**Reinhard tone mapping**为$\frac{rgb}{rgb + 1.0}$。
4. 由于人类视觉系统在白天时会自动降低exposure，防止接受过多的光；在夜晚时会增大exposure，以接受更多的光来看清环境。为了模拟这种效果，可以使用exposure tone mapping:

``` c
vec3 mapped = vec3(1.0) - exp(-hdrColor * exposure);
```
通过调整exposure值可以控制exposure。在做完tone mapping后，还需要做一个gamma correction。

5. tone-mapping和gamma correction的区别
   1. monitor能显示的值位于0-1（LDR）之间。tone-mapping是用于将color value从大于1的value（HDR）压缩到0-1（LDR）之间，并且保持压缩后的视觉效果尽量好（对比度比较高。因为直接linear转换的视觉效果就是对比度很低，大部分区域为黑色）的方法。而gamma correction是为了适应monitor的电压到亮度值的非线性映射关系，是显示的需要。
   2. 总的来说，tone mapping是为了调整视觉的对比度；gamma correction是为了调整视觉的亮度（monitor的gamma对所有值都施加同一个函数）。

### Bloom
1. 由于我们的monitors不能显示HDR image，为了营造某些区域非常亮的效果，我们可以用bloom。其是通过抠出color value大于某个阈值的fragments做blur，然后再将它们加回去实现的。

#### Extracting bright color
1. 为了获得原渲染结果以及只含有color intensity大于1的object的渲染结果，我们可以使用两个framebuffer分别存储结果，但是开销有点大。在framebuffer章节中，我们在attach color attachment时，只用到了*GL_COLOR_ATTACHMENT0*，而后面还有1、2...。因此我们可以再定义一张texture2D image，将其attach到color attachment1上。并通过指定fragment shader中的layout position，指定渲染的color写入framebuffer中的哪个color attachment。（之前都没有指定layout position，这是因为默认会写入attachment0）。
2. 当使用多个color attachments时，为了同时渲染这两个attachments，可以使用以下方法。

``` c
unsigned int attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);  
```

#### Gaussian blur
1. 二维高斯卷积可以拆成两个一维高斯卷积，以节省效率。这是通过对整张图像先做一个一维的horizontal或者vertical卷积后再做另一种卷积。
2. 想要实现良好的高斯blur效果，有两种方法
   1. 采用更大的卷积核
   2. 采用小卷积核进行多次卷积（这里使用这种）
3. 为了实现多次卷积，可以用两个framebuffer（ping-pong framebuffers），在loop中它们分别以对方的结果作为texture，然后对texture进行post-processing（blur），这样反复加工，就可以得到多次blur后的结果.

#### Blending both textures
1. 将blur后的只含有high light的texture加到原场景中，然后做tone-mapping以及gamma correction。
