
const LocalDateTime = require('@js-joda/core').LocalDateTime;
const ChronoUnit=require("@js-joda/core").ChronoUnit;
const DateTimeFormatter=require('@js-joda/core').DateTimeFormatter;


class BatterySlot{
    constructor(msg){
        let dateTimeformater=DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss');
        this.readTimeStamp=LocalDateTime.parse(msg.payload.uploadTime,dateTimeformater).plusHours(1);
        //this.length=LocalDateTime.now().until(readTimeStamp,ChronoUnit.SECONDS)*1000;
        this.length=null;
        this.producedInWatsH=msg.payload.acpower;
        this.feededInWatsH=msg.payload.feedinpower;
        this.consumedInWatsH=this.producedInWatsH-this.feededInWatsH;
    }

    calcLenght(b){
        this.length=this.readTimeStamp.until(b.readTimeStamp,ChronoUnit.SECONDS)*1000;
    }

    get(){
        return {
            readTimeStamp:this.readTimeStamp,
            length:this.length,
            producedInWatsH:this.producedInWatsH,
            feededInWatsH:this.feededInWatsH,
            consumedInWatsH:this.consumedInWatsH
        };
    }
}

module.exports = function(RED) {
    var currentSlot=null;
    var receivedSlot=null;
    
    function VirtualBatterySlotterNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input',function(msg, send, done){
           receivedSlot=new BatterySlot(msg);
           if(currentSlot!==null){
              
            /// prevent flooding from client with repeated values
            if(receivedSlot.readTimeStamp.equals(currentSlot.readTimeStamp)){
                    node.status({fill:"orange",shape:"dot",text:"Not fresh data"});
                   done();
                   return;
               }

               currentSlot.calcLenght(receivedSlot);
           }else{
               currentSlot=receivedSlot;
           }
          
           msg.payload=currentSlot.get();
           send(msg);
           currentSlot=receivedSlot;
           node.status({fill:"green",shape:"dot",text:"Reporting"});
            done();
        });
    }
    
    RED.nodes.registerType("virtual-battery-solax-slotter",VirtualBatterySlotterNode);
}
