# Beautiful Vscode Extension

## Python Indent
Automatically generate indent.

## indent-rainbow
Visualize the indent.

## Code Runner
快速运行code
1. cpp配置
   1. ```cmd + P```，输入*setting.json*，找到*code-runner.executorMap*。
   2. 找到其中的*cpp*。
   3. 输入:
        ``` json
        "cpp": "clang++ -o $dir$fileNameWithoutExt $dir$fileName $workspaceRoot/glad.c -framework Cocoa -framework OpenGL -framework IOKit -framework Corevideo -framework coreFoundation -lglfw3 -ldl -Wno-deprecated && $dir$fileNameWithoutExt"
        ```
        ``` json
        $dir // 代表当前要运行的cpp文件的目录
        $fileNameWithoutExt //代表当前要运行的文件的前缀名，即我们生成的可执行文件的名称
        $fileName // 代表当前要运行的文件的全名
        $workspaceRoot // 代表当前vscode打开的工作区root
        // 其中的&&是用于shell中执行，代表继续执行后面的command，这里为打开生成的可执行文件
        ```
2. 