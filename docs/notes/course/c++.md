# Learn C++

## C++ Basics

### 1.1 Statements and the structure of a program
1. statement指的就是以分号结尾的一行代码。
2. ```return 0;```是为了告诉os，代码顺利执行完了。
3. **syntax**：就像语言的句子有语法一样，C程序也有基本的语法，其叫做syntax。当编译出现*syntax error*时，代表代码有语句写错了，通常可能是少了个分号（semicolon）。
4. C++中的*library*指的是预先编译好的代码，它们是为了后续调用生成的。*Standard Library*是C++自带的，例如*iostream*。

### 1.2 Comments
1. *Comments*：指的是注释。
2. 有两种注释的方法
   1. 单行注释：用双斜线
   2. 多行注释：用"/\*"和"\*/"包起来
3. 规则：多行注释不能嵌套，但是多行注释中可以有单行注释。

### 1.3 Introduction to objects and variables
1. **objects**：指的是具有值或者其它属性的memory区域。被赋予name的objects称为variables（变量），variables的name称为这个variable的identifier。
2. 程序中所有定义的变量，都是在running的时候才被实际定义并被分配实际的内存，这称为**instantiation**。而一个被instantiated的object也被称为**instance**。

### 1.4 Variable assignment
1. **assignment**：指的是给一个已经定义的变量赋值。
2. **initialization**：指的是在定义变量时就赋值。定义时没赋值的称为**default initialization**

    1. **尽量在任何时候都用list initialization**

    ``` c
    // 以下在c++17能够执行
    int a = 5; // copy initialization(将右边的value直接copy过去)
    int a(5); // direct initialization(对class、struct初始化时比较高效)

    // list/uniform/brace initialization (modern c++最为常用)
    int a {5}; // direct list initialization(preferred)
    int b = {6}; // copy list initialization
    int c {}; // value initialization（通常在这里会被直接初始化为0）

    // multiple
    int a, b{5};
    int a{5}, b{6};
    int a{}, b{};
    ```

   1. 在c++中，有些initialization需要用copy，有些需要用direct，有些需要用list。但是**list initialization**可以兼容所有，**因此建议全部用这个**。
   2. **list initialization**还有一个好处就是，当我们赋予类型不同的value时会报错，但是其它的不会。

    ``` c
    int a = 4.5; // 最后a会是4
    int a(4.5); // 最后a会是4
    int a {4.5}; // 会报错
    ```
   3. value initialization。当我们马上就会改变变量的值时，用下面的第一种方式；当我们不会改变变量值，而是经常会调用，则用第二种方式。

    ``` c
    int a {};
    int a {0};
    ```

3. 当我们在code中initialize一个变量，但是没有使用时，C++会出现warning，且当我们开启*-Werror=unused-variable*时，warning会被直接当成error，造成编译失败。c++17中，为了解决这个问题，我们可以用一以下办法。

   ``` c
    [[maybe_unused]] int x { 5 }; // 告诉编译器可能不会使用
   ```

### 1.5 Introduction to iostream: cout, cin, and endl
1. *cout*输出的内容首先会被送到buffer中，然后当buffer中的数据量达到一个batch的size后，或者数据量没有达到但是已经经过了预先定义的时间后还没有满，buffer一次性将这些数据送到console输出。后续的数据只能等待buffer输出后，再送入其中。
2. 在*std::endl*和*"\n"*之间，首要选择*"\n"*。因为前者不仅换行，还要求将buffer数据立马送到控制台；但是后者只是往buffer中送入换行符号，还是由system按照定时去传递buffer数据。
3. 当我们用*cin*将数据送入某一个variable时，最好在送入前，对这个数据进行initialization。

   ``` c
    int a {};
    std::cin << a; 
   ```

4. *cin*和*cout*接收的都是character，即字符。但是*cin*会根据变量的类型进行转换。

### 1.6 Uninitialized variables and undefined behavior
**要对所有定义的变量进行初始化，否则这样的错误会非常难找到**

1. **uninitialized variable**：被定义但是没有进行初始化的变量。它们的值完全是随机的，取决于memory中刚好是什么值。一旦变量的值是已知的，它就不是uninitialized。
2. 为什么不对所有定义的为初始化的变量赋予类似0这样的默认初始化值？因为在早期的C语言中，由于硬件不行，如果对一个int数组进行这种默认初始化，可能需要很长时间。但是现在的硬件已经非常好了，我们可以选择对它们进行0初始化，这花不了多久时间。
3. 如果我们使用了未经初始化的variable，c++17会报warning。
4. **undefined behavior（UB）**：**uninitialized variable**就是其中的一种。指的是一种代码执行后的结果，这个代码并没有被C++良好地定义。
5. **undefined behavior（UB）** 可能产生以下效果：
   1. 每次运行结果不同
   2. 持续产生同样的错误结果
   3. 有时产生正确结果，有时错误
   4. 程序立马崩溃或晚点崩溃
   5. 程序能够在某些编译器上运行，其它编译器不行（不同编译器对于undefined behavior的标准不同，但是C++ standard compiler总是正确的，我们要确保总是使用standard）

### 1.7 Keywords and naming identifiers
1. **keywords**：类似```float, return```这种。
2. 命名：定义变量名（identifier）时，第一个character最好是小写字母（lower case letter），而不是下划线（underscore）或者大写字母。数字作为第一个character是不允许的。

### 1.8 Whitespace and basic formatting
1. whitespace规则：c++中，每一块以分号结尾的代码，中间都可以空n个whitespace，甚至可以空lines，它们都会在编译时被忽略。唯一会被注意的就是双引号中的whitespace，它们会被打印出来。还有一种例外就是，两个string之间若有whitespace或者line或者Tab，它们会被堆叠，如下：

``` c
cout << "Hello "
    "World!"; // 会输出Hello World!
```

2. formatting：c++没有严格的格式限制，但是以下的格式是被推荐的格式
   1. 大括号的两半最好各占一行，而不是左括号与code一行，右括号单独占一行。
   2. 一行的代码最好不要太长（不要超过屏幕区域）。这通过换行实现。
   3. 如果需要换行时，最好把operator（+-*/）放在换行后的行首，而不是放在上一行的行末。
   4. 连续定义多个变量时，最好把多个定义的等号对齐；连续单行注释多行时，每一行的注释符号对齐。


### 1.9 Introduction to literals and operators
1. **Literals**：那些被我们直接写入代码的常量（number、letter等）。
2. **side effects**：一些操作符（operator）除了返回一些值之外，还能产生一些别的效果。例如```x = 5```中，```=```operator将5赋值给了x，导致x一直是5。
3. ```=```和```<<```往往会将它们左侧的operands的return。

```c
x = (y = 5); // y=5会将y的值进行return，return给x。
std::cout << x << y; // std::cout << x将std::cout返回给y，继续进行std::cout << y。
```

### 1.10 Introduction to expressions
1. **expressions**：An expression is a combination of literals, variables, operators, and function calls that calculates a single value。
2. **evaluation**：The process of executing an expression is called evaluation。
3. expressions的常用形式：
   1. literals：2、"abc"
   2. variables：x、y
   3. 2 + 3
   4. function：注意，函数也是一种特殊形式的expressions
4. 几个概念的区分：
   1. expression：只是一个计算式，不含分号。```x = 5```
   2. expression statement：含有分号的计算式 ```x = 5;```
   3. statement that contains expression：一个含有expression的statement。```int x = 5;```

## C++ Basics: Functions and Files

### 2.1 Introduction to functions
1. 在c++中，不能嵌套定义函数，即不能在一个函数中定义另一个函数并调用，即使在main函数中也不能定义另一个函数。
2. 定义函数时，第一行称为function header；函数中的内容称为function body。

### 2.2 Functions return values
1. main函数return的0称为*status code*或*exit code*或*return code*，其代表函数顺利执行完成，若非0代表执行失败。我们也可以不让main函数return任何值，这时main函数默认会return 0，但是强烈建议必须加return 0。
2. 在c++中，*0*和*EXIT_SUCCESS*都代表执行成功，*EXIT_FAILURE*代表执行失败。它们都可以被main函数return。

``` c++
int main()
{
    return EXIT_FAILURE;
}
```

3. 如果我们定义了一个value-returning function（return type非void），但是没有返回对应type的value，就会发生*undefined behavior*。
4. 如果我们定义了value-returning function，但是在调用时不需要用到它的值，那么调用时会忽略其return value，不会报错。

``` c
int five()
{
    return 5;
}

int main()
{
    five(); // 不会报错，只会忽略其返回值
}
```

5. 如果我们定义了一个函数，但是在调用时没有加上括号以及其中的参数（即只用函数名），其可以通过编译，且c++17会默认将函数名代表的变量设置为true，在打印时会显示为1。
6. 恪守"Don't repeat yourself" rule（DRY），将重复的代码全部用function代替。

### 2.3 Void functions(non-value returning functions)
1. void function在函数末尾会自动返回到caller处（调用函数的地方），不需要return statement。
2. 在void function内return value会造成compile error。
3. **early return**：没有在函数末尾return，而是在满足一定条件后就return。有些编译器可能会因为这样而报错。

### 2.4 Introduction to function parameters and arguments
1. **function parameters**：函数的形参。
2. **argument**：调用函数时传入的实参。
3. **pass by value**：arguments只是把自己的值传递给函数内的parameters。函数被调用时，首先为自己的形参定义variables，然后把实参的值传递给定义的variables。

### 2.5 Introduction to local scope
1. **local variables**：定义在函数内部的variables称为local variables（局部变量）。其包括直接在function body定义的variables和function parameters（因为其也是在function内部定义并接受实参作为其初始化值的）。
2. 在函数内部定义的local varibles会在函数结束的时候（另一半大括号），按照定义的顺序的相反顺序销毁（先定义的后销毁，因为是用堆栈存放的）。**注意：变量的定义（creation）和销毁（destruction）只在runtime时进行，编译（compile time）时不会进行这些操作。**
3. **local scope**：定义了identifier在哪里可以被seen并used。它是一个compile-time property。
   1. **in scope**：能被seen且used。
   2. **out of scope**：不能被seen且used。
   3. **going out of scope**：out of scope的主语是identifier（object的名字）；而going out of scope的主语是objects。当一个函数运行到末尾（右半大括号）时，定义在其中的objects就是going out of scope。
4. **lifetime**是一个runtime property，**scope**是一个compile-time property。

### 2.7 Forward declarations and definitions
1. c文件的编译是按照顺序往下编译的，因此如果我们将函数定义在main函数后面，而main函数中调用了这些函数，会造成编译失败，因为main函数不知道调用的函数是什么。
2. 两种解决方式
   1. 将被调用的函数定义在调用其的函数前面。**缺点**：如果A函数要调用B，而B函数也要调用A，那么不论怎么组织它们的先后定义顺序，都必然会报错。
   2. 使用**forward declaration**：即在main函数前面声明调用的函数。只需要写function header加一个分号即可。
    ``` c
    #include <iostream>

    int add(int x, int y); // forward declaration of add() (using a function declaration)

    int main()
    {
        std::cout << "The sum of 3 and 4 is: " << add(3, 4) << '\n'; // this works because we forward declared add() above
        return 0;
    }

    int add(int x, int y) // even though the body of add() isn't defined until here
    {
        return x + y;
    }
    ```

3. 如果我们申明了函数，但是没有定义这个函数。compile能够通过，但是link通不过。
4. definition rule：
   1. 在一个代码文件里，对同一个变量、函数等，只能有一个定义。若不满足，会出现compile error。
   2. 在一个program中（可能调用多个头文件，所有头文件中的所有内容加一起算一个program），同一个变量、函数等只能有一个定义。若不满足，会出现link error。
5. 几个定义
   1. **Definition**：定义函数或变量。一个**Definition**同样也是一个**Declaration**，即起到**Declaration**的作用。
   2. **Declaration**：只告诉编译器有这个函数或变量等，其并不创造objects或functions。
    ``` c
    void foo();
    int x; // 其不是pure declaration，因为在declare x的同时，也对其进行了define。
    ```

   3. **Pure declaration**：只是声明，但是没有定义。如```void foo();```

6. **declare只针对compiler而言，compile的时候只需要知道调用的函数、变量等有没有被声明，即能不能找到其identifier。definition是针对linker的，在link的时候，需要对声明的函数寻找其define的地方，并判断define的方式和调用或声明的方式是否匹配，若不匹配则报错，否则将其地址送给callee，用于直接根据地址调用。**

### 2.8 Programs with multiple code files
1. 如果我们想把一些常用的函数打包在一起，可以重新建立一个cpp file，然后把那些函数放入其中。在编译时，将我们想要运行的cpp file和打包的cpp file一起在shell运行。那么在link时，会把我们的打包cpp file与现在的cpp file link到一起，这就可以使用之前定义的函数了。
2. **把多个cpp file放在一起运行时，它们的编译是独立开来的，各自的内容不会被对方所感知，只有在link时，它们之间的互相调用才能实现。**
3. 在2.7中的第六点中，已经说明了申明是针对compiler而言的，如果我们当前的cpp file想要调用另一个cpp file中的函数时，如果在当前cpp中没有对这个函数的声明，那么就会产生编译错误。因此为了实现这个目的，我们必须要在当前cpp file中对函数进行声明，这就保证了不会在compile阶段出错，而在link阶段，就可以根据函数名去别的cpp file中寻找这个函数了。
4. 若想要在vscode的task.json中配置将多个cpp file一起编译，可以将其中的```"${file}"```替换为```""${fileDirname}\\**.cpp"```，这可以将当前cpp file所处目录下的所有cpp file一起打包进行编译。
5. 例子

``` c
add.cpp

int add(int x, int y)
{
    return x + y;
}

main.cpp

int add(int x, int y); // 若不声明会出现compile error。

int main()
{
    std::cout << add(3, 4);
    return 0;
}
```

``` shell
clang++ -std=c++17 -o main main.cpp add.cpp # 要把add.cpp也放到编译的内容中。
```

5. **注意：这里没有用include，只是将多个file放在一起进行编译和链接**。

### 2.9 Naming collisions and an introduction to namespaces
1. **naming collision/ naming conflict**：在同一个namespace有两个或多个identifiers相同。
2. 当naming collision发生在同一个cpp file时，会出现编译错误；当它们发生在不同的file中，但是被链接在一起时，会发生link error。
3. **namespace**：一块区域。相当于给多个相同的identifiers划分不同的区域，使它们的名字虽然相同，但是由于位于不同的namespace，而可以被compiler或linker所区分开来。
4. c++规定，在同一个namespace中，不能有相同的identifiers。
5. **global namespace**：在c++中规定，任何一个name，只要它不在一个class、function或者namespace中，那么它就位于global namespace。

``` c
#include <iostream> // handled by preprocessor

// All of the following statements are part of the global namespace
void foo();    // okay: function forward declaration in the global namespace
int x;         // compiles but strongly discouraged: uninitialized variable definition in the global namespace
int y { 5 };   // compiles but discouraged: variable definition with initializer in the global namespace
x = 5;         // compile error: executable statements are not allowed in the global namespace

int main()     // okay: function definition in the global namespace
{
    return 0;
}

void goo();    // okay: another function forward declaration in the global namespace
```

main函数也位于global namespace中。

6. **std namespace**：早期c++都会将所有的standard library放到global namespace中，那么当程序员自己编程时，由于不知道哪些name已经被standard所定义，经常会发生conflict。为了解决这个问题，c++开发者将standard library中的函数放到std namespace中，这就避免了冲突。所以我们在使用*cout*时就需要指定其namespace，```std::cout```指的其实只是```cout```函数而不是```std::cout```函数。
7. 使用namespace的两种方式（推荐第一种，这不违背namespace出现的初衷，也不容易犯错）
   1. Explicit namespace qualifier std::
      1. 使用类似cout这样的函数时，使用```std::```指明其namespace。
      2. **scope resolution operator**：指的就是```::```。
      3. **qualified name**：含有namespace前缀的identifiers称为qualified name。
   2. Using namespace std
      1. 在main函数上方加```using namespace std;```，那么就可以直接用```cout```来调用这个函数。
      2. 不推荐使用的原因：虽然类似cout、cin这样的函数我们很熟悉，不会去重新定义。但是有一些不常用的函数如果被定义在std中，而我们在定义时用了同样的name，那么就会出现error。

### 2.10 Introduction to the preprocessor
1. 一个program从preprocess到compile到link整个过程称为translation。整个过程可以看https://en.cppreference.com/w/cpp/language/translation_phases
2. 在preprocess阶段，preprocessor会将include的file原样地插入到directive处，对定义的object-like macros进行替换，去除掉所有的注释，并决定哪些内容参与编译，然后在一个file的末尾清理掉所有directives。
3. **preprocessor directives/ directives**：以```#```为开头，以```"\n"```为结尾的代码（注意不是分号结尾）。
4. preprocessor并不知道c++的语法，只知道directives的语法。

#### Macro（宏）
1. 作用：```#define```，用来指定如何将输入的文本转换为输出的文本。其直接用指定的内容替代cpp file中任何一个名称。
2. 两种Macro
   1. **object-like macros**
      1. **Object-like macros with substitution text**：```#define MAX_NUM 1000```.
      2. **Object-like macros without substitution text**：```#define MAX_NUM```。其一般用于conditional compilation（第三点）。
   2. **function-like macros**：一般不用。
3. **conditional compilation**：用于在preprocess阶段指明哪些内容将参与编译，哪些不参与。
   1. ```#ifdef #endif```
    ``` c
    #include <iostream>

    #define PRINT_JOE

    int main()
    {
    #ifdef PRINT_JOE
        std::cout << "Joe\n"; // will be compiled since PRINT_JOE is defined
    #endif

    #ifdef PRINT_BOB
        std::cout << "Bob\n"; // will be excluded since PRINT_BOB is not defined
    #endif

        return 0;
    }
    ```

   2. ```#ifndef #endif```
    ``` c
    #include <iostream>

    int main()
    {
    #ifndef PRINT_BOB // 由于其未被定义，且我们的if选择的是not，因此这部分会被编译
        std::cout << "Bob\n";
    #endif

        return 0;
    }
    ```

   3. ```#if 0 #endif```
    ``` c
    #include <iostream>

    int main()
    {
        std::cout << "Joe\n";

    #if 0 // Don't compile anything starting here（所有位于其中的都不会参与编译）
        std::cout << "Bob\n";
        std::cout << "Steve\n";
    #endif // until this point

        return 0;
    }
    ```

   4. Object-like macros don’t affect other preprocessor directives：意思就是object-like macros只对正常的c++ code有效，而不对directives有效。
    ``` c
    #define FOO 9 // Here's a macro substitution

    // FOO会在正常的c++代码中进行替换，而不会在directives中被替换
    // 由于 FOO已经被定义，因此下面的代码能够被编译
    #ifdef FOO // This FOO does not get replaced because it’s part of another preprocessor directive
        std::cout << FOO << '\n'; // This FOO gets replaced with 9 because it's part of the normal code
    #endif
    ```

4. preprocessor对cpp file逐个进行process，其加工后的code，不会再含有任何directives，它们全部被清除掉了，因为compiler不知道如何理解它们。故在一个file中的directives在其结束处理后就已经清除，不会影响别的file。
5. The scope of #defines：由于preprocessor不理解c++代码，因此在process cpp file时，其无视其它的内容，而只找以```#```开头的directives。

``` c
#include <iostream>

void foo()
{
// 由于preprocessor不理解别的内容，对它来说只有这一行能被理解。因此虽然它被定义在函数内部，但是对preprocessor来说，
// 其不管在哪里都能够被识别。唯一需要注意的就是，我们不能在其被define之前去使用它。因此下面第二个cout会出现错误（compile error）
#define MY_NAME "Alex" 
}

int main()
{
	std::cout << "My name is: " << MY_NAME << '\n';
	std::cout << MAX1 << '\n';

#define MAX1 100

	return 0;
}
```

### 2.11 Header files
1. 作用：像2.8一样，想要从别的cpp file调用函数，必须在当前cpp file中对别的函数进行声明，如果这样的函数有成百上千个时，这样做显然是不合理的，这就是header file存在的意义。其可以做到无需声明就可以调用别的file中的函数。
2. 文件名：通常为.h文件，也可以是.hpp文件，甚至可以是没有后缀的文件。
3. **注意：header只是便于我们省去了code file中的声明，但是其没有自动将其paired cpp file进行编译和link的能力，因此我们仍旧需要在运行编译时，将header file对应的cpp文件也加入命令进行编译**

#### Using standard library header files
1. 例子
``` c
#include <iostream> // iostream就是一个header file，其中包含了各种declaration

int main()
{
    std::cout << "Hello, world!";
    return 0;
}
```
![rule](/images/IncludeLibrary.jpg)

2. 使用规则：
   1. header file中一般只含有函数或者变量的声明，而不含有其定义，否则可能会导致conflict。
   2. 最好以.h作为后缀。
   3. 当其与一个code file（.cpp）配对时，它们的名称必须相同。

#### Writing your own header files
``` c
add.h

// 1) We really should have a header guard here, but will omit it for simplicity (we'll cover header guards in the next lesson)

// 2) This is the content of the .h file, which is where the declarations go
int add(int x, int y); // function prototype for add.h -- don't forget the semicolon!

main.cpp

#include "add.h" // Insert contents of add.h at this point.  Note use of double quotes here.
#include <iostream>

int main()
{
    std::cout << "The sum of 3 and 4 is " << add(3, 4) << '\n';
    return 0;
}

add.cpp

#include "add.h" // Insert contents of add.h at this point.  Note use of double quotes here.

int add(int x, int y)
{
    return x + y;
}
```
其过程如下：
![head_own](/images/head_own.jpg)

编译时也需要将add.cpp进行编译，shell命令如下：

``` shell
clang++ -std=c++17 -o main main.cpp add.cpp
```

#### Source files should include their paired header
1. 我们会发现在add.cpp文件中也include了add.h文件，尽管我们也可以不include了，但是这样做有好处：如果我们不include它，那么如果在header file中对某个函数的声明出错了（与add.cpp中的定义不同），那么这种错误只可能在link阶段被检测出来，浪费了时间。但是如果我们在add.cpp中include了header file，那么我们就可以在compile阶段就检测到这个错误，因为在编译add.cpp时，会出现error。

```c
something.h

int something(int); // return type of forward declaration is int

something.cpp

#include "something.h"

void something(int) // error: wrong return type
{
}
```

2. 因此在我们写代码时最好在cpp file中include其header file。

#### Angled brackets vs double quotes
1. include时使用尖括号（angled brackets），代表我们的preprocessor只会在我们的默认include 路径中寻找include的file。使用引号（quotes）代表只在当前file的相对路径下寻找include的file，找不到时才会去default include路径下寻找。
2. 在实际使用中，最好只用quotes去include自己写的header文件，而用angled brackets去include standard library或者第三方库。

#### Why doesn’t iostream have a .h extension?
1. 初始版本的c++中，standard library不含有namespace，因此所有的function都被定义在global namespace，它们的header file的名称后缀都为.h。但是随着c++的发展，开发者将这些函数都移到std namespace中了。为了确保以前写的代码（不含std namespace）还能继续使用，因此保留了类似iostream.h这样的standard文件，将含有namespace的内容写入了不含.h的iostream header file中。因此```#include<iostream.h> #include<iostream>```两者是完全不同的，后者含有namespace。
2. 在实际使用中，最好include存在的standard library时，都不使用.h后缀，因为它们都是旧版本的lib。而自己写的header file都以.h为后缀，以示区分。

#### Including header files from other directories
``` c
#include "headers/myHeader.h"
#include "../moreHeaders/myOtherHeader.h"
```

1. 采用以上的方式进行include非常地繁琐，一旦我们的file dir改变，就需要改变上面的路径。因此我们可以给compiler指定除了default include dir外的include dir。
2. 方法
在shell中可以这样：
``` shell
clang++ -std=c++17 -o main -I/usr/lcoal/include main.cpp
```

在vscode中，可以在task.json中的args加以下的内容
\"-I/usr/local/include\"

#### Headers may include other headers
1. 在一些header file中可能会include一些别的header file，因为它们需要别的header file中的declaration。因此当我们include我们需要的header file时，可能也会include进来别的header file。这些额外被include进来的header file称为**transitive includes**，因为它们不是我们在自己的code file中显式include的。

``` c
// 当我们的main include add.h时，会将hu.h jun.h一并include。它们就称为transitive includes。
// 在实际使用中，如果我们需要hu.h jun.h，最好在main.cpp中include它们，而不是依赖add.h include它们。
add.h

#include<hu.h>
#include<jun.h>

main.cpp
#include<add.h>
```

2. 在实际使用中，最好对自己需要的header file全部进行显式include，即在自己的code file中include所有的header file，而不是依赖于自己include的一个header file中include了别的需要的header file。这是因为不同的c++版本甚至自己写的header file可能会修改header file中的内容，如果一直依赖于transitive includes，当哪天某一个header file改变内容后，其不再include另一个我们需要的header file时，就会出错。
3. 第二点的意思是：对每一个file都include它需要的所有header file，以防出错。

#### The #include order of header files
1. 作用：选择一个include顺序，使得当某个include的header file中不含有其需要的header file时就会尽快地报错。这其实提醒我们必须做到上面第2、3点，这样就不会出现这种错误了。
2. 做法
以下面的顺序进行include
``` 
1. The paired header file（当前code file为add.cpp，那么其paired就是add.h）
2. Other headers from your project
3. 3rd party library headers
4. Standard library headers
```
这样做的好处就是，当我们没有做到每个code file都include其所有需要的header file时，会尽快报错。如若paired header file没有include 3rd party library headers时，就会报错。但是如果我们将3rd party写在上面时，即使我们没有遵守规则，也不会报错。

#### 应该遵守的规则
1. 不要include cpp file。
2. 只include自己需要的东西。
3. 每个code file都include自己需要的所有东西，而不是依赖transitive include。
4. 不要在header file中define variables或者functions。
5. code file必须与其header file的名字一样。
6. 每个header file都必须使用header guard。

### 2.12 Header guards
1. 作用：防止在include多个header file时，出现反复include同一个header file的情况。

``` c
square.h

// We generally shouldn't be defining functions in header files
// But for the sake of this example, we will
int getSquareSides()
{
    return 4;
}

geometry.h

#include "square.h"

main.cpp

#include "square.h"
#include "geometry.h"

int main()
{
    return 0;
}
```
那么在preprocessor处理时会变成：

``` c
int getSquareSides()  // from square.h
{
    return 4;
}

int getSquareSides() // from geometry.h (via square.h)
{
    return 4;
}

int main()
{
    return 0;
}
```
这就会出现重复define的错误。header guard就是解决这个问题的。

2. header guard的实现方式是在每一个header file中，配合ifndef定义一个macro，那么在反复include时，就会由于已经define而不进行编译。
3. 示例

``` c
square.h

#ifndef SQUARE_H
#define SQUARE_H

int getSquareSides()
{
    return 4;
}

#endif

geometry.h

#ifndef GEOMETRY_H
#define GEOMETRY_H

#include "square.h"

#endif

main.cpp

#include "square.h"
#include "geometry.h"

int main()
{
    return 0;
}
```

那么在preprocessor处理后变成：

``` c
// Square.h included from main.cpp
#ifndef SQUARE_H // square.h included from main.cpp
#define SQUARE_H // SQUARE_H gets defined here

// and all this content gets included
int getSquareSides()
{
    return 4;
}

#endif // SQUARE_H

#ifndef GEOMETRY_H // geometry.h included from main.cpp
#define GEOMETRY_H
#ifndef SQUARE_H // square.h included from geometry.h, SQUARE_H is already defined from above
#define SQUARE_H // so none of this content gets included

int getSquareSides()
{
    return 4;
}

#endif // SQUARE_H
#endif // GEOMETRY_H

int main()
{
    return 0;
}
```
这样就会由于已经define了某些宏，而使得header file中的内容不再重复编译，而是被preprocessor直接去掉。

#### 更为安全的header guard命名方式
1. 假设有以下情况

/usr/local/hu.h的内容为
``` c
#ifndef HU_H
#define HU_H

int sub(int a, int b);

#endif
```

/usr/bin/hu.h的内容为
``` c
#ifndef HU_H
#define HU_H

int add(int a, int b);

#endif
```

而我们的code file include这两个文件
``` c
#include</usr/bin/hu.h>
#include</usr/local/hu.h>
```

就会造成以下情况

``` c
#ifndef HU_H
#define HU_H

int add(int a, int b);

#endif

#ifndef HU_H
#define HU_H

int sub(int a, int b);

#endif
```

如果我们对所有header file的宏定义，都使用大写_H的形式的话，可能造成两个不同路径下，名称相同但内容不同的header file在include时，其中一个被丢弃。

2. 为了解决上述问题，最好的方法就是在定义宏时不要简单地都用header file name_H来命名。可以用以下方式命名

``` c
#ifndef <PROJECT>_<PATH>_<FILE>_H // TEXTURE_USR_LOCAL_INCLUDE_HU_H
#define <PROJECT>_<PATH>_<FILE>_H

...

#endif


```

#### Header guards do not prevent a header from being included once into different code files
1. header guard只能防止同样的内容因为include header file而重复出现，但是它不能防止由于code file include header file导致的重复。

``` c
square.h

#ifndef SQUARE_H
#define SQUARE_H

int getSquareSides()
{
    return 4;
}

int getSquarePerimeter(int sideLength); // forward declaration for getSquarePerimeter

#endif

square.cpp

#include "square.h"  // square.h is included once here

int getSquarePerimeter(int sideLength)
{
    return sideLength * getSquareSides();
}

main.cpp

#include "square.h" // square.h is also included once here
#include <iostream>

int main()
{
    std::cout << "a square has " << getSquareSides() << " sides\n";
    std::cout << "a square of length 5 has perimeter length " << getSquarePerimeter(5) << '\n';

    return 0;
}
```
由于我们之前强调，要在paired cpp file中也include它的header file，因此在square.cpp file中，也会存在*getSquareSides*函数。那么在进行link时，由于main函数和square.cpp函数都含有这个函数，就会发生link错误。
2. 解决方法：这就是为什么之前说不要在header file中定义函数或者变量的原因。我们可以将definition移到cpp file中，而只在header file中声明。

#### 另一种替代idndef的方法
1. 可以用
``` c
#pragma
your code...
```
来替代之前的ifndef等。其只需要一行即可。

2. 缺点：之前的方式是在prerocessor中对反复include进行判别并去除，但是现在这种方式是靠编译器完成这个任务。如果有一个header file在pc中被复制到另一个路径中，而在code file中同时include这两个header file（内容完全相同），如果采用之前的方式，可以在preprocess阶段就识别出来，进行去除；但是若使用这个方式，无法在compile阶段识别出来它们的不同，因为编译器不知道它们是完全相同的内容，这就会导致编译错误。

### How to design code
1. 将自己的代码分成多个模块，每个模块都调用一个函数。
2. 然后写出自己的main函数，写出调用函数的步骤。
3. 定义每一个函数，在定义的同时逐个测试每个函数的功能是否正常。
4. 定义完每个函数后，测试整个program是否能够work。

## Debugging C++ Programs

### 3.1 Syntax and semantic errors
1. **syntax error**：语法错误。
2. **semantic error**：符合c++语法，但是代码没有按照我们的预想去执行。（自己写的代码不符合预期；没有对变量进行初始化导致出现undifined result；除以0）

### 3.4 Basic debugging tactics
1. ```std::cout```的内容首先被送入buffer，然后才会输出，这意味着虽然从buffer到输出的时间非常短，但是仍有可能因为程序崩溃导致无法输出。为了使得我们能够立马输出我们想要的信息，可以用```std::cerr```，其使用规则同cout完全一样，只不过其一旦接收内容就会输出，而不会经过buffer。
2. 在debug时，若想要输出中间信息，可以用```std::cerr```。此外，在每个需要调用到的函数的body中的第一行，都可以加上

``` c
std::cerr << "function_name called\n";
```
这样，每当进入一个函数，就能够打印信息，这样在出错的时候，我们就知道在哪个函数内部出现了错误。
3. 打印运行信息不是一个好的debug方式，它会使你的代码混乱、需要删除等。

### 3.5 More debugging tactics
1. 使用preprocessor帮助debug
``` c
#include <iostream>

#define ENABLE_DEBUG // comment out to disable debugging

int getUserInput()
{
#ifdef ENABLE_DEBUG
std::cerr << "getUserInput() called\n";
#endif
	std::cout << "Enter a number: ";
	int x{};
	std::cin >> x;
	return x;
}

int main()
{
#ifdef ENABLE_DEBUG
std::cerr << "main() called\n";
#endif
    int x{ getUserInput() };
    std::cout << "You entered: " << x;

    return 0;
}
```
这样就可以通过注释掉```#define```使得所有的debug statement都失效，而不需要手动删除或注释每一行debug statement。

2. 1中的方法只能适用于program只有一个file的情况，如果一个program有多个file，比较好的方式是创造一个header file，在其中加入```#define```。让所有的file都include这个header file，那么我们就可以通过对这个header file中的这一行代码进行注释，使得整个program的debug statement全部失效。
3. 上述方法的缺点在于：1、debug statement会加大代码量。2、如果在program中的哪个file中忘记include header file，就会导致错误。

#### Using a logger
1. **log file**：将代码运行事件记录其中的一个磁盘文件。
2. **logging**：将信息写入logger的过程。
3. 如果想要用log，可以参考其中的plog。

### 3.6 Using an integrated debugger: Stepping
1. **step into**：逐行运行。调用函数时也会进入函数逐行运行。
2. **step over**：当运行到调用函数的line时，step over可以直接运行完这个函数并return，而不会进入这个函数。
3. **step out**：执行完当前指针所在函数内的剩余所有代码，然后return。

### 3.9 Using an integrated debugger：The call stack
1. **call stack**：指的是调用函数的堆栈，其会从上到下递归显示：当前调用的函数、调用当前函数的函数...。在call stack中显示的line number并不是当前运行到的line number，而是下一个要运行的statement的line number。

## Fundamental Data Types

### 4.1 Introduction to fundamental data types
1. **data types**：由于计算机中存储的只是二进制数，因此data type就是用来告诉计算机怎么去理解这些二进制数的。比如，int、float等。
2. **integer**：最常指的是int类型，但有时指的是所有的整数，例如long、short、unsigned int等。
3. **integral**：指的是"like a integer"。包括bool（true为1，false为0），char等。
4. 注意：string并不是fundamental data type而是compound data type。

### 4.2 Void
1. 其指的是没有类型，但是不能用其直接定义variables：
``` c
void value; // 不能这样定义
```

2. 两种用法
   1. 用于表示函数没有返回值
    ``` c
    void getValue()
    {
        cout << "";
    }
    ```
   2. 在c语言中，用于表示函数没有输入值，但是在c++中已经不再这样使用
    ``` c
    int getValue(void)
    {
        return 1;
    }

    int getValue() // 虽然在c++中也能编译通过，但是建议只用这种方式
    {
        return 1;
    }
    ```

### 4.3 Object sizes and the sizeof operator
1. 一些常用数据类型的大小
   1. bool：1byte
   2. char：1byte
   3. short：2bytes
   4. int：4bytes
   5. long：4bytes
   6. long long：8bytes
   7. float：4bytes
   8. double：8bytes
   9. long double：8bytes
2. **sizeof()**：其是一个操作符。可以返回data type或者variables的大小

``` c
sizeof(int);
int x;
sizeof(x);
struct y{};
sizeof(y);
```
   
### 4.4 Signed integers
1. 虽然long int，long long int也能编译通过，但是一般只用long和long long表示这两种数据类型。
2. 表示符号数有以下几种方式

``` c
int x;
signed int x; // 但是不用这种方式，而是上面那种，因为这样是冗余的。
```
3. **range**：每种数据类型都有一定的bytes大小，因此其能表达的数字范围是有限的。
4. **integer overflow**：当我们将大于int range的值赋予int类型的变量，则会导致溢出。这回导致undefined behavior。
5. 当我们怀疑有些value超出了data type的range时，就要用更大range的data type。
6. **integer division**：整数相除时，直接去掉小数部分，即floor。

### 4.5 Unsigned integers, and why to avoid them
1. n-bit unsigned short溢出时，其实际值可以根据取余获得。例如，若一个unsigned short=-1，那么根据$2^{16}=65536$，$-1=65536 * -1 + 65536$可得$-1%65536=65535$。或者根据补码，-1的16bit数为1111 1111 1111 1111（原码表示为1000 0000 0000 0001，非符号位取反加1即可得到补码形式），将其用unsigned short方式来理解时，其就是65535。
2. 最好不要用unsigned int，如果要用更大的正整数，可以使用long long。因为其有以下几点问题
   1. 正整数之间的减法会溢出，如```3-5```，-2会溢出。
   2. 无符号整数和有符号整数之间进行操作时，有符号整数会被转换为无符号整数，导致undefined behavior。
    ``` c
    #include <iostream>

    int main()
    {
        signed int s { -1 };
        unsigned int u { 1 };

        if (s < u) // -1 is implicitly converted to 4294967295, and 4294967295 < 1 is false
            std::cout << "-1 is less than 1\n";
        else
            std::cout << "1 is less than -1\n"; // this statement executes

        return 0;
    }
    ```
   3. 将有符号整数的负数赋值给无符号整数时，会导致溢出。
3. 使用unsigned的场景
   1. 存储量受限，但需要用到更大的positive numbers时。
   2. bit manipulation。
   3. 需要用到溢出时，比如产生指定范围的随机数时。

### 4.6 Fixed-width integers and size_t
1. 为什么int类型的数据要指定最小的size（2 Bytes），但是其在大多数machine上都是4 Bytes。因为在早期的C语言中，为了更好的performance，开发者使得程序员可以指定其size，以实现更好的表现。
2. 在实际使用中如果我们默认int就是4 bytes，那么这些程序在int=2 bytes的机器上就会导致溢出；但如果我们默认其为2 bytes，这就会浪费2 bytes。结合程序员的实际需求，c++给出了一个库(cstdint)可以指定data type的size。
![cstdint](/images/cstdint.png)

``` c
#include <cstdint> // for fixed-width integers
#include <iostream>

int main()
{
    std::int16_t i{5};
    std::cout << i;
    return 0;
}
```
3. 默认data type的size是固定的有两个缺点
   1. 不是所有机器都规定了这个data type是相同size的，可能不同。
   2. 虽然我们的cpu已经支持64bit，其速度很快。但是有时候限制我们program速度的并不是CPU，而是memory操作。或许CPU处理4 bytes的int数据很快，但是其在与RAM交换时较慢；但是虽然CPU处理2 bytes的int数据慢一点，但是其RAM交换较快。综合之下，可能还是使用2 bytes int会更快一点。

#### Fast and least integers
为了解决上面3中的问题，c++给了我们两个选择，就是用fast或者least integers。
1. ```std::int_fast#_t and std::uint_fast#_t```提供了数据大小至少为n nit时最快的bit数。```std::int_least#_t and std::uint_least#_t```提供了数据大小至少为n bit的数据。
``` c
#include <cstdint> // for fixed-width integers
#include <iostream>

int main()
{
	std::cout << "least 8:  " << sizeof(std::int_least8_t) * 8 << " bits\n";
	std::cout << "least 16: " << sizeof(std::int_least16_t) * 8 << " bits\n";
	std::cout << "least 32: " << sizeof(std::int_least32_t) * 8 << " bits\n";
	std::cout << '\n';
	std::cout << "fast 8:  " << sizeof(std::int_fast8_t) * 8 << " bits\n";
	std::cout << "fast 16: " << sizeof(std::int_fast16_t) * 8 << " bits\n";
	std::cout << "fast 32: " << sizeof(std::int_fast32_t) * 8 << " bits\n";

	return 0;
}

results

least 8:  8 bits
least 16: 16 bits
least 32: 32 bits

fast 8:  8 bits
fast 16: 32 bits // 32bits是最快的数据大小
fast 32: 32 bits
```
2. 但是使用fast或者least类型也有缺点
   1. 因为使用地少，因此可能容易导致错误。
   2. 由于不同机器上，运行最快的数据大小不同，因此相同的代码可能会产生不同的结果，导致错误。

    ``` c
    #include <cstdint> // for fixed-width integers
    #include <iostream>

    int main()
    {
        std::uint_fast16_t sometype { 0 };
        --sometype; // intentionally overflow to invoke wraparound behavior

        std::cout << sometype;

        return 0;
    }
    ```

#### std::int8_t and std::uint8_t likely behave like chars instead of integers
1. 在c++中，大部分的compiler中，都将```std::int8_t（std::int_least8_t std::int_fast8_t） std::uint8_t（std::uint_least8_t std::uint_fast8_t） ```分别视为等同于```signed char unsigned char```。但也有一些compiler例外，因此在不同的机器上，可能对于这样定义的数据类型，会产生不同的结果。**因此，如果要使用integers，最好16-bit起步**。

#### Integral best practices
遵循能够在compile time出错，绝不在runtime出错的原则（更快发现错误，节省时间），有以下几点建议：
1. 当整数数据的range不重要时（绝对不会超出range），都用*int*。例如用*int*表示年龄。
2. 当我们要存储的整数类型的range比较大时（不能用int时），最好用```std::int#_t```。
3. 在做bit manipulation或者需要利用overflow时，最好用```std::uint#_t```。

有以下几点不建议做的：
1. 不要用unsigned int存储数据。
2. 不要用fast和least integer。
3. 不要用8-bit int。（会被理解成signed char）

#### What is std::size_t?
1. 使用```sizeof()```会返回variable或者data type的Bytes数（integer），但是这个返回的value到底是什么data size的integer呢？事实上，其返回的是data type为**std::size_t**的value，其为unsigned integral。

``` c
#include <cstddef> // std::size_t
#include <iostream>

int main()
{
	std::cout << sizeof(std::size_t) << '\n';

	return 0;
}

results
4
```

2. ```std::size_t```是unsigned且至少size为16bit。但是在大多数机器上，其size等于memory address的bit宽度（因为其用来表示的objects的bytes数，一个objects的bytes大小最大不能大过address的大小，因为每个address都存放一个byte，那么address unit的数量就是机器的最大存储量）。它被定义为机器所能创造的最大的object的大小（4 bytes指的是机器能创造的最大object的大小为$2^{32}-1$bytes）（object指的是在memory中占有一定区域的数据结构），这只是理论上的最大size，实际在不同的编译器下可能会小于这个size。

### 4.7 Introduction to scientific notation
c++中用```E```或者```e```来表示指数。
``` c
2e-2
3.0e5
```

### 4.8 Floating point numbers
1. size
![floatsize](/images/floatsize.png)
2. 在初始化或者使用float数据类型时，必须在整数后面加小数，如5.0。

#### Printing floating point numbers
``` c
#include <iostream>

int main()
{
	std::cout << 5.0 << '\n';
	std::cout << 6.7f << '\n';
	std::cout << 9876543.21 << '\n';

	return 0;
}

results

5 // c++默认不会打印小数当其为0时
6.7
9.87654e+06
```
#### Floating point precision
1. 由于data size是有限的，因此其能表示的数据精度也是有限的。
2. float类型的精度一般是6-7个有效数字；double的精度一般是15-16个有效数字；long double一般是33-36个有效数字：因为数据的尾数位数是有限的，而能表达出来的数字都是通过尾数实现的，阶数只能控制小数点的位置。那么以float为例，其尾数一共有$23+1=24$位（其中的1位为隐藏位），对于任意一个浮点数，我们假设都可以通过控制阶数来使其所有的小数部分都被转换为整数（乘以$2^{-n}$）,那么由于其尾数只有24位，其能表达的最大整数为$2^{24}=16777216$（可以为1.6777216，16.777216，1677721.6或16777216.0），这就是它能表达的最大的有效数字，大于这个数字的有效数字都无法被正确表示，只能控制阶数，使其尽可能近似。（注意这个有效数字指的是从左到右，不论是整数部分的数字还是小数部分的数字，都算在里面，最大能表示16777216这个数字，因为小数点的位置可以由阶数来控制。）因此我们说float的有效精度为6-digits（完全不会出错）加上部分7-digits（只到16777216）。
3. ```std::cout ```默认数据的有效数为6位，即其能显示的有效数为6位，超出6位的部分会被截断（6位是*float*数据类型最小可能的的有效数精度）。

``` c
#include <iostream>

int main()
{
    std::cout << 9.87654321f << '\n';
    std::cout << 987.654321f << '\n';
    std::cout << 987654.321f << '\n';
    std::cout << 9876543.21f << '\n';
    std::cout << 0.0000987654321f << '\n';

    return 0;
}

results

9.87654
987.654
987654
9.87654e+006 // 由于编译器不同，有些编译器可能会指定最小的指数位数，很明显这台机器的最小指数位数为3
9.87654e-005
```

3. **precision**：指的是在没有信息损失的前提下能够准确表示的最大有效数位数。
4. 可以通过c++中的*iomanip*库指定cout输出的最大有效数位数。
``` c
#include <iostream>
#include <iomanip> // for output manipulator std::setprecision()

int main()
{
    std::cout << std::setprecision(16); // show 16 digits of precision
    std::cout << 3.33333333333333333333333333333333333333f <<'\n'; // f suffix means float
    std::cout << 3.33333333333333333333333333333333333333 << '\n'; // no suffix means double

    return 0;
}

results

3.333333253860474
3.333333333333334
```
可以发现，float类型的精度为7位，double则更多。

``` c
#include <iomanip> // for std::setprecision()
#include <iostream>

int main()
{
    float f { 123456789.0f }; // f has 10 significant digits
    std::cout << std::setprecision(9); // to show 9 digits in f
    std::cout << f << '\n';

    return 0;
}

results

123456792 // y偶遇有效位数只有7位，因此第8位出现了错误。
```
5. **rounding error**：当数字没办法被精确存储时。
6. 最好所有的浮点数都用*double*类型。

#### Rounding errors make floating point comparisons tricky
1. 在十进制数中，我们可以精确地写出0.1，但是在二进制数中，0.1无法用二进制数精确地表达出来，因此我们随意初始化的浮点数，在存储为二进制数时并不是真正等于我们赋予的值，这就发生了rounding errors。

``` c
#include <iomanip> // for std::setprecision()
#include <iostream>

int main()
{
    double d{0.1};
    std::cout << d << '\n'; // use default cout precision of 6
    std::cout << std::setprecision(17);
    std::cout << d << '\n';

    return 0;
}

results

0.1
0.10000000000000001
```
2. 当我们进行浮点数运算时，rounding errors会随着运算逐渐积累，直到达到比较大的误差。

``` c
#include <iomanip> // for std::setprecision()
#include <iostream>

int main()
{
    std::cout << std::setprecision(17);

    double d1{ 1.0 };
    std::cout << d1 << '\n';

    double d2{ 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 }; // should equal 1.0
    std::cout << d2 << '\n';

    return 0;
}

results

1
0.99999999999999989
```
3. 由于rounding errors的存在，我们所认为的确切的浮点数并不一定是确切的浮点数，因此我们不能直接比较两个浮点数（==或<等）。

#### NaN and Inf
1. **inf**：指的是infinity，在除以0时会发生。（比如5.0/0.0或-5.0/0.0）
2. **NaN**：指的是非数（not a number）。（比如0.0/0.0）

### 4.9 Boolean values
定义
``` c
bool a;
bool a {true};
bool a {!true};
```

#### Printing Boolean values
正常用cout打印都是0或者1，可以控制cout打印方式，使其打印出true或者false。
``` c
#include <iostream>

int main()
{
    std::cout << true << '\n';
    std::cout << false << '\n';

    std::cout << std::boolalpha; // print bools as true or false

    std::cout << true << '\n';
    std::cout << false << '\n';
    return 0;
}
```

#### Integer to Boolean conversion
1. 将任何整数（包括正整数和负整数）值赋值于bool类型时，都会被转换为true；0被赋值于bool类型时，会被转换为false。
2. **注意：在初始化时，将非true或者false外的integers赋值给bool 类型时，会出错。只能在定义完成后，再进行赋值**

``` c
bool a {4}; // error
bool a = 4; // correct
std::cout << a; // results: 1
std::cout << std::boolalpha;
std::cout << a; // results: true
```

#### Inputting Boolean values
1. 当用cin接受bool类型输入时，只有数字才能被正确接受（非0整数接受为true；0接受为false），如果输入true或者fals或者其它字符串，都会识别为false。只有当设置```std::boolalpha```时，才能接受true或者false作为输入，**但是设置这个过后，所有的整数都无法正常被接受。两种方式只能二选一**。

``` c
#include <iostream>

int main()
{
	bool b{};
	std::cout << "Enter a boolean value: ";

	// Allow the user to enter 'true' or 'false' for boolean values
	// This is case-sensitive, so True or TRUE will not work
	std::cin >> std::boolalpha;
	std::cin >> b;

	std::cout << "You entered: " << b << '\n';

	return 0;
}
```

### Chars
1. 表示单个字符（character）。其被存储为整数，是integral，范围为0-127，代表着ASCII码。0-31为不可打印的字符，32-127是可打印字符。

#### Initializing
``` c
char ch2{ 'a' }; // initialize with code point for 'a' (stored as integer 97) (preferred)
char ch1{ 97 }; // initialize with integer 97 ('a') (not preferred)
```

#### Printing
当变量类型为char时，用cout打印的结果为character而不是integer。
``` c
#include <iostream>

int main()
{
    char ch1{ 'a' }; // (preferred)
    std::cout << ch1; // cout prints character 'a'

    char ch2{ 98 }; // code point for 'b' (not preferred)
    std::cout << ch2; // cout prints a character ('b')


    return 0;
}

results

ab
```

#### Inputting chars
1. cin输入只能为字符而不能是数字，因为cin只接受输入的第一个字符。（输入数字，无法识别是字符‘2’还是ascii码为2的字符，因此统一只能接收字符而不是integer）。
2. cin每次只能接收单个字符，但是cin允许输入字符串，其只接收第一个字符，剩余的字符被存到cin对应的buffer中去，后续字符可以继续调用cin从buffer中逐个读取。

``` c
#include <iostream>

int main()
{
    std::cout << "Input a keyboard character: "; // assume the user enters "abcd" (without quotes)

    char ch{};
    std::cin >> ch; // ch = 'a', "bcd" is left queued.
    std::cout << "You entered: " << ch << '\n';

    // Note: The following cin doesn't ask the user for input, it grabs queued input!
    std::cin >> ch; // ch = 'b', "cd" is left queued.
    std::cout << "You entered: " << ch << '\n';

    return 0;
}

shell

Input a keyboard character: abcd
You entered: a
You entered: b
```

#### Char size, range, and default sign
1. char的大小为1byte。由于我们的ascii码只到127，因此无需指定unsigned char，因为signed char范围为-128~127。但是如果我们为了memory需要用char存储一些小的整数时，必须指定signed或者unsigned。

#### Escape sequences
1. 以\符号为start的字符串，其表示转义符。

#### What’s the difference between putting symbols in single and double quotes?
1. 单引号代表字符，双引号代表字符串。
2. 虽然双引号也可以表示单个字符，但是最好单个字符都用单引号，这有利于编译器更好地优化。
3. **注意：'\n' 也属于单个字符**。

#### Avoid multicharacter literals
1. 避免使用单引号内多个字符的情况，尽管有些编译器支持这种操作，但是容易出错。

``` c
#include <iostream>

int add(int x, int y)
{
	return x + y;
}

int main()
{
	std::cout << add(1, 2) << '/n';

	return 0;
}

results

312142
```
这里由于斜杠方向打错，导致在打印出3后又打印了一串数字，这是不同编译器决定的。

#### What about the other char types, wchar_t, char16_t, and char32_t?
1. ```wchar_t```已经几乎不用。
2. ascii码的编码为1byte，但是有一些别的编码需要用到很多数字去编码一个字符（比如中文），因此需要更多bits去表示。这就是```char16_t char32_t```存在的意义，它们往往用于Unicode的编码。UTF-8表示8-bits，UTF-16表示16-bits，UTF-32表示32-bits。

### 4.12 Introduction to type conversion and static_cast
1. **type conversion**：将一种数据类型转换为另一种数据类型
2. **implicit type conversion**：不是由我们显式地进行转换。例如将int实参传给float形参。

#### Type conversion produces a new value
其并不能改变原变量的值，而是创造一个新的变量存放转换后的值。

#### Implicit type conversion warnings
1. 有些类型转换是安全的，不会产生错误，如int转double；但是有些类型转换是不安全的，如double转int。对类型进行转换时，**编译器都会报warning**。
2. 由于存在不安全的情况，因此才会建议使用brace initialization，因为其会报错，帮我们早点发现错误。
``` c
int main()
{
    double d { 5 }; // okay: int to double is safe
    int x { 5.5 }; // error: double to int not safe

    return 0;
}
```

#### An introduction to explicit type conversion via the static_cast operator
1. 使用显式类型转换时，我们在告诉编译器这是我们自己的选择，**因此编译器不会再报warning**，如果出现了错误，由程序员自己承担。
2. 用法：```static_cast<new_type>(expression)```。type可以为```int double bool```等。
``` c
#include <iostream>

void print(int x)
{
	std::cout << x;
}

int main()
{
	print( static_cast<int>(5.5) ); // explicitly convert double value 5.5 to an int

	return 0;
}
```

3. 当在我们的程序出现angled brackets时(```<>```)，位于其中的往往是一个data type，这是c++处理data的方式。

#### Using static_cast to convert char to int
``` c
#include <iostream>

int main()
{
    char ch{ 97 }; // 97 is ASCII code for 'a'
    std::cout << ch << " has value " << static_cast<int>(ch) << '\n'; // print value of variable ch as an int

    return 0;
}

results

a has value 97
```

#### Using static_cast to convert char to int
1. c++默认会把char类型以字符形式输出，如果我们想打印字符的ascii码，可以将其转换为int类型再打印。

#### Converting unsigned numbers to signed numbers
1. 如果unsigned int的range大于signed int，则会造成错误。**因此，要牢记，在使用static_cast时，必须确保没有错误，因为此时编译器不会再帮我们识别是否有错**。

#### std::int8_t and std::uint8_t likely behave like chars instead of integers
1. 在定义这两个数据类型时，c++默认它们代表的是char类型，因此即使我们将int赋值给它们，打印时也会打印字符。

``` c
#include <cstdint>
#include <iostream>

int main()
{
    std::int8_t myint{65};
    std::cout << myint; // will print A
    std::cout << static_cast<int>(myint); // will always print 65

    return 0;
}
```
2. **注意：由于其类型是char，因此如果用cin接受输入，其也会将其识别为char，如果我们输入35，其读取的只是第一个字符‘3’**

### 4.13 Const variables and symbolic constants

#### The const keyword
尽管将const放在类型前或者后都可以，但是最好将其放在前面，这更符合我们的语言习惯。
``` c
const char a;
char const a;
```

#### Const variables must be initialized
必须给其正确的初始化。如果不初始化，会报错；如果采用随机初始化，那么由于其不能再改变的性质，这个变量相当于废了。
``` c
const int a; // error
const int a {};
std::cin >> a; // error
```
#### Const function parameters
**这使得函数的形参，在函数内部无法被人为改动，能够保持不变。但是因为这个变量只存在于函数内部，函数结束后就会被清除，因此其是否能够改变也没那么重要。所以，一般不对形参使用const**

``` c
#include <iostream>

void printInt(const int x)
{
    std::cout << x << '\n';
}

int main()
{
    printInt(5); // 5 will be used as the initializer for x
    printInt(6); // 6 will be used as the initializer for x

    return 0;
}
```

#### Const return values
这样使用也没有实际意义，因为函数的返回值只是瞬态的。在一般的fundamental data type前使用const，会直接被忽略。这样使用const，甚至可能导致编译器低效，因此一般不这么用。

``` c
#include <iostream>

const int getValue()
{
    return 5;
}

int main()
{
    std::cout << getValue() << '\n';

    return 0;
}
```

#### For symbolic constants, prefer constant variables over object-like macros
1. **symbolic constant**：定义一个const variable存放literal的值，而不是直接在code中使用literal。这样能够使得代码易于理解，且容易改变literal的值，否则如果多处地方都使用一个literal，会需要改每一处地方。
2. 宏与const variables的抉择：
   1. 宏不是变量，在debug时无法显示其值，必须要找到其定义才知其值，不利于debug。
   2. 宏的名称可能与我们在code中定义的变量名冲突，这会导致preprocessing时把我们的变量进行宏替换。
   3. 宏没有scope限制，容易导致错误。
3. **尽量使用const variables而不使用宏**
4. 像$\pi$这种常数，有被很多file使用的需求，我们也可以使用const variables（后续章节）。

### 4.14 Compile-time constants, constant expressions, and constexpr

#### Constant expressions
1. **Constant expressions**：在compile-time可以被执行的expressions。
2. 对于一些常数表达式，如果它们位于code的for循环中，意味着即使它们的值在code中永远不改变，在每次run-time循环中它们也必须被执行一次，这是极其低效的。为了解决这个问题，compiler可以在compile-time只执行这些expressions一次，而在run-time直接以这个结果替代那些表达式，而不需要反复执行。**这就是compiler的optimization**

#### Compile-time constants
Literals是在compile-time就知道的constant，如1，2，“Hello”。

#### Compile-time const
1. 如果一个const变量在定义时，以constant expression初始化，那么这个变量就是compile-time const。且这个定义具有递归性，如下面的代码中，x、y成为compile-time const，那么z也是。
``` c
#include <iostream>

int main()
{
	const int x { 3 };  // x is a compile-time const
	const int y { 4 };  // y is a compile-time const

	const int z { x + y }; // x + y is a constant expression, so z is compile-time const

	std::cout << z << '\n';

	return 0;
}
```

#### Runtime const
1. 任何const变量在初始化时，不是以constant expression初始化的，那么其就是runtime const。

#### The constexpr keyword
1. 当我们使用```const```，有时有些变量会成为compile-time const，有时会成为run-time const，我们不一定能分辨出来。为了确保有些变量就是compile-time const，我们可以使用```constexpr```来定义compile-time const，只有确实是compile-time const的变量才能被其成功定义，否则会报错，那么我们就能确定其一定是compile-time const。而对于初始化值不是const expression的变量，我们要用```const```定义。

``` c
#include <iostream>

int five()
{
    return 5;
}

int main()
{
    constexpr double gravity { 9.8 }; // ok: 9.8 is a constant expression
    constexpr int sum { 4 + 5 };      // ok: 4 + 5 is a constant expression
    constexpr int something { sum };  // ok: sum is a constant expression

    std::cout << "Enter your age: ";
    int age{};
    std::cin >> age;

    constexpr int myAge { age };      // compile error: age is not a constant expression
    constexpr int f { five() };       // compile error: return value of five() is not a constant expression

    return 0;
}
```

#### Constant folding for constant subexpressions
对于一些含有constant subexpression的expression，compiler也可以把其中的sub expression在compile-time进行运算。（注意：std::cout也算是expression，因为<<也是operator）。

``` c
#include <iostream>

int main()
{
	std::cout << 3 + 4 << '\n'; // this is a runtime expression

	return 0;
}
```

### Literals
1. 整数类型不加后缀，默认为int
2. 浮点数类型不加后缀，默认为double
3. 科学技术法表示的浮点数也为double

``` c
float f { 4.1 }; // warning: 4.1 is a double literal, not a float literal
float f { 4.1f }; // use 'f' suffix so the literal is a float and matches variable type of float
double d { 4.1 }; // change variable to type double so it matches the literal type double

double avogadro { 6.02e23 }; // 6.02 x 10^23 is a double literal in scientific notation
```

#### Literal Suffixes
![literals](/images/literal.png)
由于小写的l看起来像1，因此建议全部用大写的L。

### 4.16 Numeral systems (decimal, binary, hexadecimal, and octal)
1. 若想要用8进制，则可以在literal前加上0；若想要用16进制，则在literal前加0x；若想要用2进制，则在literal前加0b（若要用0b来表示，其以16 bits方式对齐，见下面的example）。

``` c
#include <iostream>

int main()
{
    int x{ 012 }; // 0 before the number means this is octal
    std::cout << x << '\n'; // 10

    int x{ 0xF }; // 0x before the number means this is hexadecimal
    std::cout << x << '\n'; // 15

    int bin{};        // assume 16-bit ints
    bin = 0b1;        // assign binary 0000 0000 0000 0001 to the variable
    bin = 0b11;       // assign binary 0000 0000 0000 0011 to the variable
    bin = 0b1010;     // assign binary 0000 0000 0000 1010 to the variable
    bin = 0b11110000; // assign binary 0000 0000 1111 0000 to the variable

    return 0;
}
```
#### Digit separators
1. 仅供代码阅读时的直观作用，可以将其加在数字之间。（**但是注意不能加在前缀与数字之间**）
``` c
#include <iostream>

int main()
{
    int bin { 0b1011'0010 };  // assign binary 1011 0010 to the variable
    long value { 2'132'673'462 }; // much easier to read than 2132673462

    int bin { 0b'1011'0010 };  // error: ' used before first digit of value
    return 0;
}
```

#### Outputting values in decimal, octal, or hexadecimal
1. 不管我们以几进制定义的数，c++默认以十进制方式输出，如果我们需要以不同进制输出，可以zhiding```std::dec std::oct std::hex```

``` c
#include <iostream>

int main()
{
    int x { 12 };
    std::cout << x << '\n'; // decimal (by default)
    std::cout << std::hex << x << '\n'; // hexadecimal
    std::cout << x << '\n'; // now hexadecimal
    std::cout << std::oct << x << '\n'; // octal
    std::cout << std::dec << x << '\n'; // return to decimal
    std::cout << x << '\n'; // decimal

    return 0;
}
```

#### Outputting values in binary
1. std::cout没有为2进制的输出指定方式，但是在```<bitset>```头文件中，存在着```std::bitset<>```可以为我们创建一个temporary的二进制object，在用cout对其打印时，可以以二进制方式输出。**std::bitset<>可以指定变量bit数，且对其初始化可以采用任意进制的literal**

``` c
#include <bitset> // for std::bitset
#include <iostream>

int main()
{
	// std::bitset<8> means we want to store 8 bits
	std::bitset<8> bin1{ 0b1100'0101 }; // binary literal for binary 1100 0101
	std::bitset<8> bin2{ 0xC5 }; // hexadecimal literal for binary 1100 0101

	std::cout << bin1 << '\n' << bin2 << '\n';
	std::cout << std::bitset<4>{ 0b1010 } << '\n'; // create a temporary std::bitset and print it

	return 0;
}

results

11000101
11000101
1010
```

### String

#### String input with std::cin
1. 当用cin读取string时，其默认以space作为一个string读取的结束符号，因此用cin不能读取带有空格的string。

``` c
#include <iostream>
#include <string>

int main()
{
    std::cout << "Enter your full name: ";
    std::string name{};
    std::cin >> name; // this won't work as expected since std::cin breaks on whitespace

    std::cout << "Enter your age: ";
    std::string age{};
    std::cin >> age;

    std::cout << "Your name is " << name << " and your age is " << age << '\n';

    return 0;
}

shell

Enter your full name: John Doe
Enter your age: Your name is John and your age is Doe
```

#### Use std::getline() to input text
1. 若用读取包含空格的string，需要用到```std::getline()```
``` c
#include <string> // For std::string and std::getline
#include <iostream>

int main()
{
    std::cout << "Enter your full name: ";
    std::string name{};
    std::getline(std::cin >> std::ws, name); // read a full line of text into name

    std::cout << "Enter your age: ";
    std::string age{};
    std::getline(std::cin >> std::ws, age); // read a full line of text into age

    std::cout << "Your name is " << name << " and your age is " << age << '\n';

    return 0;
}
```

#### What the heck is std::ws?
1. 就像std::cout可以用```std::setprecision()```来控制其输出一样，std::cin也可以控制其读取的方式，而std::ws就是其中一种控制方式。std::ws是用来忽略string中的leading whitepace（whitespace、tab、newlines）的。

``` c
#include <string>
#include <iostream>

int main()
{
    std::cout << "Pick 1 or 2: ";
    int choice{};
    std::cin >> choice;

    std::cout << "Now enter your name: ";
    std::string name{};
    std::getline(std::cin, name); // note: no std::ws here

    std::cout << "Hello, " << name << ", you picked " << choice << '\n';

    return 0;
}

shell

Pick 1 or 2: 2
Now enter your name: Hello, , you picked 2
```

由于std::cin在接受内容时，都是以字符串方式存储，因此当我们输入 1并且按下enter键时，cin的buffer中实际存储的是"1\n"，然后根据定义的数据类型，提取int数据——1，剩下的"\n"会被留在cin的buffer中，供后续使用。而当getline生效时，cin中已经存有newline，因此getline判断我们输入了一个空字符串后按下了enter键（getline只接收一行的字符串，当其看到newline后就只读取前面的内容），故name变量实际得到的是空字符串。为了解决这个问题，std::ws被引入其中，其用于忽略一个字符串中的首个whitespace。

``` c
#include <string>
#include <iostream>

int main()
{
    std::cout << "Pick 1 or 2: ";
    int choice{};
    std::cin >> choice;

    std::cout << "Now enter your name: ";
    std::string name{};
    std::getline(std::cin >> std::ws, name); // note: added std::ws here

    std::cout << "Hello, " << name << ", you picked " << choice << '\n';

    return 0;
}

shell

Pick 1 or 2: 2
Now enter your name: Alex
Hello, Alex, you picked 2
```
2. 如果要使用std::getline，最好也用上std::ws。（如果我们只需要读取一个variable的值，那么确实不需要用到std::ws，因为不会有下一个cin读取buffer中的newline。但是如果我们要用到多个读取，那么势必会出错。因此加上std::ws成本非常小。）
3. **std::cin>> 会自动忽略leading whitespace；但是std::getline不会，其需要配合std::ws使用**

#### String length
1. length()是std::string的member function，其只能通过```object.function```来调用，而不能通过```function(object)```来调用。

``` c
#include <iostream>
#include <string>

int main()
{
    std::string name{ "Alex" };
    std::cout << name << " has " << name.length() << " characters\n";

    return 0;
}
```
2. 用length()成员函数得到的value的类型为unsigned int或者```size_t```而不是signed int，为了使用int，可以用static_cast。

``` c
int length { static_cast<int>(name.length()) };
```

#### std::string can be expensive to initialize and copy
std::string在初始化和copy时，都需要额外创造一个新的std::string，开销很大。

#### Literals for std::string
1. 使用双引号的string，其默认类型为C语言的string类型，而不是std::string类型。为了使其为std::string类型，需要在其后面加上s后缀。或者使其为```std::string_view```类型，需要在其后面加sv后缀。**若用使用这些后缀，必须加上using namespace std::literals。因为std::string不是c++的fundamental data type，其不像int、float等有默认的后缀**

``` c
#include <iostream>
#include <string>      // for std::string
#include <string_view> // for std::string_view

int main()
{
    using namespace std::literals; // easiest way to access the s and sv suffixes

    std::cout << "foo\n";   // no suffix is a C-style string literal
    std::cout << "goo\n"s;  // s suffix is a std::string literal
    std::cout << "moo\n"sv; // sv suffix is a std::string_view literal

    return 0;
};
```

2. ```using namespace std::literals```是为数不多的可以使用的简化方式，因为我们写的code不可能与其产生冲突。
3. 大多数情况下，即使以c语言string类型的literal作为std::string的初始化，是没有问题的。但是有些情况下std::string会更方便。

#### Constexpr strings 
1. 在c++17及其之前的版本，constexpr不能用于std::string的定义，其在c++20版本中可以使用。**但是std::string_view可以支持用constexpr定义。**
``` c
#include <iostream>
#include <string>

using namespace std::literals;

int main()
{
    constexpr std::string name{ "Alex"s }; // compile error

    std::cout << "My name is: " << name;

    return 0;
}
```

### 4.18 Introduction to std::string_view
1. std::string的initialization（将literal copy到变量对应的内存中）和copy的开销比较大，速度比较慢。为了解决这个问题，自c++17开始，可以使用```std::string_view```来解决，其位于```<string_view>```头文件中。

``` c
#include <iostream>
#include <string>

void printString(std::string str)
{
    // 在function内部创建std::string str临时变量，并把实参的值copy过来
    std::cout << str << '\n';
}

int main()
{
    std::string s{ "Hello, world!" }; // 第一次copy到内存中
    printString(s);

    return 0;
}

```
这里用到了两次copy，开销比较大。

2. std::string_view可以不对string做copy，而只是以read-only的方式获取其内容。**可以理解为它不必在内存中创建object来存放string的内容，但可以读取到string的内容**。

``` c
#include <iostream>
#include <string_view>

void printSV(std::string_view str) // now a std::string_view
{
    std::cout << str << '\n';
}

int main()
{
    std::string_view s{ "Hello, world!" }; // now a std::string_view
    printSV(s);

    return 0;
}
```
在上面的代码中，不存在对c语言literal进行copy，而只是对其进行简单的读取。
3. **std::string_view适用于read-only的情况下，尤其是函数传参时使用。如果我们需要改变string的值，还是需要std:string**

#### constexpr std::string_view
1. std::string_view支持constexpr。

#### Converting a std::string_view to a std::string
1. 要么直接创建一个std::string类型变量，并以std::string_view类型的变量进行初始化；要么用static_cast进行类型转换。
``` c
#include <iostream>
#include <string>
#include <string_view>

void printString(std::string str)
{
    std::cout << str << '\n';
}

int main()
{
  std::string_view sv{ "balloon" };

  std::string str{ sv }; // okay, we can create std::string using std::string_view initializer

  // printString(sv);   // compile error: won't implicitly convert std::string_view to a std::string

  printString(static_cast<std::string>(sv)); // okay, we can explicitly cast a std::string_view to a std::string

  return 0;
}
```

#### Literals for std::string_view
使用sv后缀指定为std::string_view类型，否则为C-style类型

``` c
#include <iostream>
#include <string>      // for std::string
#include <string_view> // for std::string_view

int main()
{
    using namespace std::literals; // easiest way to access the s and sv suffixes

    std::cout << "foo\n";   // no suffix is a C-style string literal
    std::cout << "goo\n"s;  // s suffix is a std::string literal
    std::cout << "moo\n"sv; // sv suffix is a std::string_view literal

    return 0;
};
```

#### Do not return a std::string_view

## Operators

### 5.1 Operator precedence and associativity

#### expression order issue
看下面这段代码
``` c
#include <iostream>

int getValue()
{
    std::cout << "Enter an integer: ";

    int x{};
    std::cin >> x;
    return x;
}

int main()
{
    std::cout << getValue() + (getValue() * getValue()); // a + (b * c)
    return 0;
}

shell 
1 2 3
```
在加号的两侧分别有一个operand，如果加法的计算顺序是left-to-right，那么第一个函数会得到1，第二三个函数分别得到2、3，计算结果为7；如果计算顺序是right-to-left，那么第二三个函数分别得到1、2，第一个函数得到3，计算结果为5。这就造成了ambiguity，不同的机器可能有不同的计算方式，因此我们最好消除这种ambiguity。

``` c
#include <iostream>

int getValue()
{
    std::cout << "Enter an integer: ";

    int x{};
    std::cin >> x;
    return x;
}

int main()
{
    int a{ getValue() }; // will execute first
    int b{ getValue() }; // will execute second
    int c{ getValue() }; // will execute third

    std::cout << a + (b * c); // order of eval doesn't matter now

    return 0;
}
```

### 5.2 Arithmetic operators

#### Integer and floating point division
1. Floating point division：只要至少有一个为浮点数就为浮点数除法。
2. Integer division：两个都为整数时就为整数除法。

#### Using static_cast<> to do floating point division with integers
1. 如果想对两个整数使用浮点数除法，需要用static_cast将其中一个整数转换为浮点数。
2. 也可以将被除数乘上1.0然后做除法。

#### Dividing by 0 and 0.0
1. 除以0会直接crash
2. 除以0.0，要么返回Nan，要么返回Inf，取决于不同的pc。

#### Arithmetic assignment operators
除了```+= -= *= /=```还有一个```%=```

### 5.3 Modulus and Exponentiation

#### Modulus with negative numbers
**算x%y时，结果的符号与x相同**
``` c
6 % (-4) = 2 // 6 = (-4) * (-1) + 2
-6 % 4 = -2 // -6 = 4 * (-1) - 2
```

#### exponent operator
1. ```std::pow()```函数存在于头文件```include <cmath>```中，其参数均为double，因此可能出现rounding error。
2. 如果要对整数做pow，必须要自己写函数。（**整数算pow常常会溢出**）

``` c
#include <iostream>
#include <cstdint> // for std::int64_t
#include <cassert> // for assert

// note: exp must be non-negative
std::int64_t powint(std::int64_t base, int exp)
{
	assert(exp >= 0 && "powint: exp parameter has negative value");

	std::int64_t result{ 1 };
	while (exp)
	{
		if (exp & 1)
			result *= base;
		exp >>= 1;
		base *= base;
	}

	return result;
}

int main()
{
	std::cout << powint(7, 12); // 7 to the 12th power

	return 0;
}
```

#### Side effects can cause undefined behavior
1. **side effects**：当函数或者计算式在调用结束或者计算结束后，除了return一个value，还有额外的effect，这个effect就称为side effect。比如，```++x```，这个expression在return x+1的值后，还改变了x的值；```add(x, ++y)```，这个函数在return加法值后，还改变了y的值。
2. side effect可能会导致undefined behavior

``` c
#include <iostream>

int add(int x, int y)
{
    return x + y;
}

int main()
{
    int x{ 5 };
    int value{ add(x, ++x) }; // is this 5 + 6, or 6 + 6?
    // It depends on what order your compiler evaluates the function arguments in

    std::cout << value << '\n'; // value could be 11 or 12, depending on how the above line evaluates!
    return 0;
}
```
由于c++没有规定输入函数的参数中，哪个参数先在其中被定义，因此当上面的函数中，第一个参数和第二个参数以不同的顺序被定义时，会产生不同的结果。**这都是源于c++没有规定哪个函数参数最先在function body中被定义**。

3. 因此，为了解决上面的情况。**必须确保在一行代码中，含有side effect的变量不会被使用超过1次**。