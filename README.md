
## ETL ( Embedded Test Language )

### 简介

+ ETL 是嵌入式测试专用描述语言 
+ ETL文件是扩展名为 `.etl` 的文本文件
+ ETL文件由ETL元素声明组成

### 注释

+ ETL单行注释使用 //...
+ ETL多行注释使用 /* ... */
+ 注释的规则和 C、Java、C#、JavaScript等程序语言相同

### 字符串

+ ETL同时支持单引号字符串和双引号字符串
+ 字符串规则和Python、JavaScript等语言相同


### ETL元素

+ ETL元素是ETL文件的直接组成单元

+ ETL元素描述语法

    - 元素描述的语法为: `元素类型 元素名称 { ... }`，类似于程序语言class声明方式
    
        > 举例：设备拓扑描述  
        ```
        topo topo_1 
        { 
            ... 
        }
        ```

        > 举例：协议描述  
        ```
        protocol prot_1 
        { 
            ... 
        }
        ```

+ 根级元素

    * ETL代码文件的根级元素包括以下类型：
        - [protocol](#PROTOCOL)：协议模版描述
        - device：设备及接口描述
        - topo：连接拓扑描述
        - panel：监控面板描述

+ 二级元素

    * 二级元素描述只能出现在根级元素描述内部
    * 不同类型的根级元素内，可用的二级元素类型不同

        > 举例：协议 `prot_1` ，由一个协议段 `seg_1` 组成

        ```
        prototcol prot_1 
        {
            segment seg_1 { ... } 
        } 
        ```

+ 元素属性

    * 每种元素都具有多个属性
    * 元素属性赋值语法为： ` 属性名称: 属性值 `，类似于JavaScript里的字面量对象
    * 多个元素属性连续赋值时使用逗号分隔，最后一个属性赋值后面的逗号可以省略

        > 举例：协议段 `seg_1` 的解析器属性为8位无符号整数
        ```
        segment seg_1 { parser: 'uint8' } 
        ```

## <span id="PROTOCOL">协议</span>

- 用于描述一个协议模版，使用关键字 `protocol`
- 协议名称在同一项目内必须唯一

### `protocol` 内部元素

- 内部元素类型

    * `segment` 协议段，由协议段名称和协议段属性组成
    * `segments` 协议组，由协议组名称和子级协议段组成
    * `oneof` 协议分支，由判定条件和分支协议段组成

    > 举例：包括各类元素的协议

    ```
    prototcol prot_1 
    {
        //协议段
        segment msg_type { ... } 

        //协议组
        segments point {
            segment x { ... }
            segment y { ... }
        }

        //协议分支
        oneof(this.msg_type == 1) {

            //分支协议段
            ....
        }

        oneof(this.msg_type == 2) {
            ....
        }

        //协议段
        segment tail { ... }
    } 
    ```

- 协议段引用

    * 协议段属性赋值时可以使用 `this.seg_name` 的方式来引用其它协议段
    * 可以使用计算表达式给协议段属性赋值

- 协议内置函数

    * `ByteSize` 函数接收一个协议段引用，返回协议段的字节长度
    * `CheckCode` 函数用于计算校验值
        - CheckCode接收3个参数，依次为校验函数、校验开始协议段、校验结尾协议段
        - 后两个参数为可选参数，默认从协议第一个协议段开始，至校验码字段的前一个协议段结束
        - 校验函数可以是[内置校验函数](#check_fun)、自定义CRC函数或用户自定义函数
        - 自定义CRC函数使用数组的方式描述，数组前3个值为数字，后2个值为布尔值，依次为
            > [ 多项式值, CRC初始值, 结果异或值, 是否反转输入, 是否反转输出 ]

            > 举例：32位CRC校验字段设置
            ```
            segment seg_crc { 
                parser: 'uin32', 
                autovalue: CheckCode([0x04C11DB7, 0xFFFFFFFF, 0xFFFFFFFF, true, true], this.seg_begin, this.seg_end)
            }

            ```

- 空协议段
    * 可以定义只有名称，无任何属性的空协议段
    * 空协议段在解析时将被忽略
    * 空协议段可以用来标识字节流位置
    * 空协议段可以用来分割连续的`oneof`分支


### `segment` 协议段

+ `parser`：解析器属性

    * 描述协议段的解析方式，值类型为字符串或自定义解析对象

    * 可使用的字符串值由以下取值组成:

        - 数据类型：`int1` ~ `int64`、`uint1` ~ `uint64`、`float`、`double`、`string`
        - 大端序：`>`
        - 小端序：`<` 
        - 反码：`!`
        - 补码：`&`
        - 默认使用主机本地字节序的原码

        > 举例：描述多个协议段
        
        ```
        protocol prot_1 {
            segment seg_1 { parser: 'uint2' }
            segment seg_2 { parser: 'uint20' }
            segment seg_3 { parser: 'uint10' }
            segment seg_4 { parser: 'float >' }
        }
        ```

    * `parser`属性的值也可以是自定义解析对象
    * 自定义解析对象包含`pack`、`unpack`属性，分别用于指定打包和解包函数名

        > 举例：使用自定义解析函数的字段

        ```
        protocol prot_1 {

            segment seg_1 {
                parser: { pack: MyPackFn, unpack: MyUnpackFn } 
            }

        }
        ```

+ `autovalue` 自动赋值属性

    * 当消息数据打包时，如果对应协议段的值为空，则解析器自动使用`autovalue`属性值打包
    * `autovalue`属性值可以设置为常量、数组、协议段引用、内置函数调用或计算表达式

+ `length` 字符串长度属性

    * 用于设置字符串类型的协议段字节长度
    * `lenght`属性值可以为常数、协议段引用或计算表达式

+ `endwith` 字符串结尾标识符

    * 用于设置识别字符串结尾标识的字符片段
    * 如果已经设置`length`属性，该属性将被解析器忽略
    * 如果`length`属性和 `endwith`属性均没有设置，则解析器使用`'\0'`做为`endwith`的值进行解析

### `segments` 协议组

+ 协议组用于将多个协议段组合在一起，并使用相同的父级对象名
+ 协议组可以多层嵌套使用
+ 协议组可以设置为数组类型

    > 举例：表示连续100个坐标点的协议描述

    ```
    protocol prot_1 {

        segment HEADER { parser: 'uint16', autovalue: 0x55AA }

        segments POS[100] {
            segment X { parser: 'float' }
            segment Y { parser: 'float' }
        }   

    }
    ```


### `oneof` 协议分支

+ 当`oneof`判定条件计算结果为`true`时，解析器进入分支内部进行解析

+ 当`oneof`判定条件计算结果为`false`时，跳过该分支

+ 连续多个`oneof`分支，解析器只会解析第一个判定条件为`true`的分支


### `[ ]` 协议段数组

+ `segment` 和 `segments` 均可设置为数组
+ 在协议段名称后跟 `[ ]` 来标识数组
+ 中括号内为数组的长度，长度值可以为常数、协议段引用或计算表达式

    > 举例：动态长度的协议段 seg_arr
    ```
    protocol prot_1 {

        segment seg_len { parser: 'int32', autovalue: ByteSize(this.seg_arr) }

        segment seg_arr[this.seg_len] { parser: 'uint8' }

    }
    ```

### <span id="checkfn">内置校验函数</span>

#### 普通校验函数

名称|说明
-|-
SUM_8 | _ 
XOR_8 | _ 
SUM_16 | _ 
SUM_16_FALSE | _ 
XOR_16 | _ 
XOR_16_FALSE | _ 
SUM_32 | _ 
SUM_32_FALSE | _ 
XOR_32 | _ 
XOR_32_FALSE | _ 


#### 循环冗余校验函数

名称|多项式|初始值|结果异或值|反转输入|反转输出
-|-|-|-|-|-|
SUM_8 | _ | _ | _ | _ | _ |
XOR_8 | _ | _ | _ | _ | _ |
SUM_16 | _ | _ | _ | _ | _ |
SUM_16_FALSE | _ | _ | _ | _ | _ |
XOR_16 | _ | _ | _ | _ | _ |
XOR_16_FALSE | _ | _ | _ | _ | _ |
SUM_32 | _ | _ | _ | _ | _ |
SUM_32_FALSE | _ | _ | _ | _ | _ |
XOR_32 | _ | _ | _ | _ | _ |
XOR_32_FALSE | _ | _ | _ | _ | _ |
CRC_4_ITU | _ | _ | _ | _ | _ |
CRC_5_EPC | _ | _ | _ | _ | _ |
CRC_5_ITU | _ | _ | _ | _ | _ |
CRC_5_USB | _ | _ | _ | _ | _ |
CRC_6_ITU | _ | _ | _ | _ | _ |
CRC_6_CDMA2000A | _ | _ | _ | _ | _ |
CRC_6_CDMA2000B | _ | _ | _ | _ | _ |
CRC_7 | _ | _ | _ | _ | _ |
CRC_8 | _ | _ | _ | _ | _ |
CRC_8_EBU | _ | _ | _ | _ | _ |
CRC_8_MAXIM | _ | _ | _ | _ | _ |
CRC_8_WCDMA | _ | _ | _ | _ | _ |
CRC_10 | _ | _ | _ | _ | _ |
CRC_10_CDMA2000 | _ | _ | _ | _ | _ |
CRC_11 | _ | _ | _ | _ | _ |
CRC_12_CDMA2000 | _ | _ | _ | _ | _ |
CRC_12_DECT | _ | _ | _ | _ | _ |
CRC_12_UMTS | _ | _ | _ | _ | _ |
CRC_13_BBC | _ | _ | _ | _ | _ |
CRC_15 | _ | _ | _ | _ | _ |
CRC_15_MPT1327 | _ | _ | _ | _ | _ |
CRC_16_ARC | _ | _ | _ | _ | _ |
CRC_16_BUYPASS | _ | _ | _ | _ | _ |
CRC_16_CCITTFALSE | _ | _ | _ | _ | _ |
CRC_16_CDMA2000 | _ | _ | _ | _ | _ |
CRC_16_CMS | _ | _ | _ | _ | _ |
CRC_16_DECTR | _ | _ | _ | _ | _ |
CRC_16_DECTX | _ | _ | _ | _ | _ |
CRC_16_DNP | _ | _ | _ | _ | _ |
CRC_16_GENIBUS | _ | _ | _ | _ | _ |
CRC_16_KERMIT | _ | _ | _ | _ | _ |
CRC_16_MAXIM | _ | _ | _ | _ | _ |
CRC_16_MODBUS | _ | _ | _ | _ | _ |
CRC_16_T10DIF | _ | _ | _ | _ | _ |
CRC_16_USB | _ | _ | _ | _ | _ |
CRC_16_X25 | _ | _ | _ | _ | _ |
CRC_16_XMODEM | _ | _ | _ | _ | _ |
CRC_17_CAN | _ | _ | _ | _ | _ |
CRC_21_CAN | _ | _ | _ | _ | _ |
CRC_24 | _ | _ | _ | _ | _ |
CRC_24_FLEXRAYA | _ | _ | _ | _ | _ |
CRC_24_FLEXRAYB | _ | _ | _ | _ | _ |
CRC_30 | _ | _ | _ | _ | _ |
CRC_32 | _ | _ | _ | _ | _ |
CRC_32_BZIP2 | _ | _ | _ | _ | _ |
CRC_32_C | _ | _ | _ | _ | _ |
CRC_32_MPEG2 | _ | _ | _ | _ | _ |
CRC_32_POSIX | _ | _ | _ | _ | _ |
CRC_32_Q | _ | _ | _ | _ | _ |
CRC_40_GSM | _ | _ | _ | _ | _ |
CRC_64 | _ | _ | _ | _ | _ |




