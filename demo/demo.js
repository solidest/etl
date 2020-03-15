import { languages } from "vscode"

protocol pro_1 {
    segment seg_1 {
        parse: 'int8 > !', autovalue: 0, repeated: 1
    }
    segment seg_2 {
        parse: 'Int8Array', autovalue: 0
    }
    segments seg_3 {
        segment seg_1 {
            parse: 'int8 > !', autovalue: 0, repeated: 1
        }
        segment seg_2 {
        }
    }
    oneof(self.seg1==1) {
        segment seg_1{
            parser: Int8Array, autovalue: 0
        }
        segment seg_2{
            parser: Int8Array, autovalue: 0
        }
    }
    oneof(self.seg1==2) {
        segment seg_1 {
            parser: Int8Array, autovalue: 0
        }
        segment seg_2 {
            parser: Int8Array, autovalue: 0
        }
    }
    when(self.token==9) {
        segment seg_1 {
            parser: Int8Array, autovalue: 0
        }
        segment seg_2 {
            parser: Int8Array, autovalue: 0
        }
    }
}

device dev_1 {
    connector inf_1 {
        type: 'com_232', baudrate: 9600, 
    }
    connector inf_2 {
        type: 'com_422', baudrate: 9600, 
    }
}

join join_1{

    channel ch_1{
        left: dev_1.inf_2,
        right: dev_2.inf_1
    }

    msbus bus_1{
        masters: [dev_1.inf_1]
        slaves: [dev_1.inf_1, dev_2.inf_1]
    }

    ppbus bus_2{
        peers: [dev_1.inf_1, dev_2.inf_1, dev_3.inf_1]
    }
}

panel panel_1 {
    button w_1 {
        cell:
    }
}


using './pkg_1.py' as pkg1
using './pcg_3.h' as pkg3
using './pkg_4.lua' as pkg4

run run_1 {

    vars data_1 {
        v1: 1,
        v2: 'abcd',
        v3: {a: 1, b: 'abc'}
    }

    listen l_1 {
        dev1.inf1: function (data, direct, prot) {
            
        }
    }

    watch data_1 {
        data_1.v1 : function(new_value, old_value) {

        } 
    }

    mapping map_1 {
        panel1.widget1.value: this.data_1.v1,
        panel2.widget2.value: this.data_1.v2,
    }

    play pl_1 {
        entry: function(data, option) {
            let local_v1 = 0
            let local_v2 = 'aaa'
            let local_d1 = null
            let local_op1 = null
    
            startWatch()
            startListen()

            let data1 = prot_1({
                ... ,
                seg1: this.v1,
                seg2: this.v2,
            })
    
            send(dev1.inf1, data1, 1000, {opt1: true})
            beginSend(dev1.inf1, prot_1, 1000, {opt1: true}, self.callback)
            let data1 = recv(dev1.inf1, prot_1, 1000, {opt1: true})
            beginRecv(dev1.inf1, prot_2, 1000, {opt1: true}, self.callback)
            let v1 = read(dev1.inf10)
            write(dev1,inf12, v1)
            beginRead(dev1.inf10, callback)
            beginWrite(dev1.inf11, v1, callback)
            
            delay(1000)

            stopWatch()
            stopListen()
        }

        fun_1: function(arg1, arg2) {
            return arg1 + arg2
        }        
    }

    play pl_2 {
        entry: function(data, option) {
            
        }
    }


}
