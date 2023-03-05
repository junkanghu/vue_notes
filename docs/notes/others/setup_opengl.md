# This is for opengl setup.

## on Mac

### build opengl
1. go to https://www.glfw.org/download.html
2. download 64-bit macOS binaries
3. unzip the downloaded zip file
4. open the directory, you will see as below
   ![opengl](/images/opengl_file.png)
5. open the *include* folder, you will see *GLFW* folder, move it to the c++ linker by

``` shell
sudo mv GLFW /usr/local/include/
```

6. then open the *lib-arm64* folder, move both *libglfw.3.dylib* and *libglfw3.a* to the target lib folder by

``` shell
sudo mv * /usr/local/lib/
```

**All above can be replaced by download the source package of GLFW and by Cmake, but the file libglfw.3.dylib won't be generated, which is gotten by downloading the mac binaries and move it to the target folder**

7. Then go to https://glad.dav1d.de/ to download glad
8. choose the options as below

![glad_options](/images/glad_config.png)

then move to the end of the page and click **GENERATE**

9. download the *.zip* files
10. after ```unzip``` the file, open the *include* folder, move both folders(*KHR* and *glad*) to the folder by

``` shell
sudo mv * /usr/local/include/
```

11. then open the *src* folder, copy the *glad.c* file to your project root directory.
12. By now, everything is setup. You can run in your terminal under the project dir as

``` shell
clang++ -o hello_triangle/hello_triangle.exe hello_triangle/hello_triangle.cpp glad.c -framework Cocoa -framework OpenGL -framework IOKit -lglfw3 -Wno-deprecated
```

if *Cocoa* and others do not exist, consider using cmake to build glfw, which may generate these ones.

### build Assimp
1. 问题：最新版的Assimp无法与LearnOpengl适配，因为LearnOpengl编写时Assimp最高版本是3.3.1。但是直接在官网下载3.3.1进行编译会出错，无法正常生成*libassimp*。即使可以把3.3.1的source code中的include直接粘贴到mac中c++的索引路径下，由于没有lib也无法正常运行。
2. 解决方法：
   1. 去官网下载4.0.0版本的Assimp。然后根据指示能够正常编译并install。
   2. 此时会发现在*/usr/local/include*下面正常生成了assimp文件夹，在*/usr/local/lib*下生成了*libassimp.3.3.1.dylib*、*libassimp.3.dylib*、*libassimp.dylib*。猜测include下的header文件已经是4.0.0版本，但是lib中的内容还只是3.3.1版本的。
   3. 验证发现，4.0.0版本能够与learnopengl适配，或者要是有强迫症，可以把下载的3.3.1版本中的include粘贴到*/usr/local/include*下，把4.0.0编译后的header文件移除。
3. 如何使用
   1. 能够import Assimp后，还需要在shell运行的command后面加上*-lassimp*才能正常使用。
   2. 虽然能够正常编译通过，但是会有很多warning。
   3. 第一个warning是```warning: offset of on non-POD type 'Vertex' [-Winvalid-offsetof]```。指的是*offsetof*使用地不那么正确。可以在编译命令后加上```-Wno-invalid-offsetof```隐藏warning。
   4. 第二个warning是```taking address of packed member 'r' of class or structure 'aiColor3D' may result in an unaligned pointer value [-Waddress-of-packed-member]```。可以通过在编译命令后加上```-Wno-address-of-packed-member```来隐藏。
   5. 至此，能够正确编译且不显示任何warning。
