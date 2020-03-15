
# ETL 嵌入式测试语言 ( Embedded Test Language )

## 简介

ETL 是用于嵌入式系统测试的程序语言，使用ETL可以开发嵌入式测试用例，以及对测试环境中使用的通信协议、设备接口、交联关系进行描述。

## ETL 文件

ETL文件是扩展名为 `.etl` 的文本文件

ETL文件由若干个根级元素声明组成

### 文件引用

ETL文件可以相互引用，语法为 `using ”代码文件“`

举例：引用同级目录下的代码文件 `src_1.etl`

> `using "./src_1.etl"`

### 函数包引用

使用其它程序语言开发的函数，可以通过引用函数包的方式在ETL代码文件中使用

函数包引用语法为 `using 代码文件 as 函数包名`

ETL函数包可以使用以下程序语言定义的函数：

- Python
- Lua
- .h 头文件声明的动态库导出函数

举例：引用同级目录下的Python代码文件`src_a.py`，引用后的包名为`pkg_1`

> `using "./src_a.py" as pkg_1 `

## 元素

元素是ETL文件的直接组成单元

### 元素声明语法

元素声明的语法为: `元素类型 元素名称 { ... }`

举例：一个测试执行的定义 

> `run testcase_1 { ... }`

举例：一个协议模版的定义 

> `protocol prot_1 { ... }`

### 根级元素

ETL代码文件的根级元素包括以下类型：

- run：用于定义一个测试执行
- protocol：用于定义一个协议模版
- device：用于定义一个设备描述
- join：用于定义一个设备链接方案
- panel：用于定义一个可视化监控面板

### 二级元素

二级元素定义只能出现在根级元素定义内部

不同类型的根级元素内，可用的二级元素类型不同

举例：协议 `prot_1` ，由一个协议段 `seg_1` 组成

> ` prototcol prot_1 { segment seg_1 { ... } } `

### 元素属性

每种元素都具有多个属性

元素属性分为固定属性和自定义属性两种

#### 元素属性设置

元素属性赋值语法为： ` 属性名称: 属性值 `

多个元素属性连续赋值时使用逗号分隔，最后一个属性赋值后面的逗号可以省略

举例：设置协议段 seg_1 的解析属性为32位整型解析

> ` segment seg_1 { parse: "int32", ... }`

#### 自定义属性和固定属性

可以由开发人员定制的元素属性称为自定义属性

可自定义属性的元素有：

- `run` 内定义的二级元素

- `package` 内定义的二级元素

其它元素属性均为固定属性，属性名称不可以定制

#### 可变属性值与不可变属性值

可以在运行时修改属性值的元素有：

- `run` 内定义的二级元素 `vars`
- `panel` 内定义的二级元素

其它元素属性值只能在元素定义时进行设置

### 表达式

分为判断表达式和计算表达式，可以在在元素声明中使用的

### 判断表达式

### 计算表达式


## 执行代码

执行代码只能出现在函数体内，是用于实现函数功能的可执行程序语句

单条ETL程序语句使用 `;` 结尾

## 数据类型

ETL拥有动态类型，相同的变量可用作不同的类型

### 值类型

ETL中的值类型包括:

- `string` 字符串
- `number` 数字
- `bool` 布尔
- `null` 空

### 引用类型

ETL 中的引用类型包括：

- `object` 对象
- `function` 函数
- `array` 数组

### 变量、常量与字面量

### 变量

- let

### 常量

- 数字

- 字符串

### 字面量

- object

## 控制语句

### 协议定义控制语句

- oneof
- when

### 程序控制语句

- if else 
- while
- for

## 运算符


## 表达式

### 计算表达式

### 判断表达式

## API

- 协议定义API

- 运行时API










