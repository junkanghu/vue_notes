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
8. 在texture中与VAO、VBO有一点不同的在于，VAO等一次只能bind一个object，即激活一个object，当需要使用其它的object的时候，需要再次bind那个object。但是在texture中，由于我们有mix texture的需求，因此希望能够一次activate两个texture map。为了迎合这种需求，*GL_TEXTURE_2D*上有多个texture units，在不做任何处理的前提下，默认激活第0个unit，每个unit只能放一个texture，且多个units可以同时激活。在*glBindTexture*时，我们默认把texture bind到*GL_TEXTURE_2D*上面的第0个texture unit上面，为了使用多个texture，我们可以激活不同的texture units，然后分别把不同的texture bind到上面，可以使用*glActiveTexture*来激活不同的texture units。
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