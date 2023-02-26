import {BatterySlot} from '@virtualbat/entities/dist/src/BatterySlot.js';
import {LocalDateTime,ChronoUnit,DateTimeFormatter} from '@js-joda/core';


export class NodeSolaxSlotter {
    currentSlot:BatterySlot|null=null;
    receivedSlot:BatterySlot|null=null;
    node:any=null;
    readTimeStampOffset:number;

    constructor(node:any){
      this.node=node;
      this.readTimeStampOffset=0;
    }

    onInput(msg:any,send:any,done:any){
        let dateTimeformater=DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss');
        let batSlotPayload:any={};
        batSlotPayload.readTimeStamp=LocalDateTime.parse(msg.payload.uploadTime,dateTimeformater).plusHours(this.readTimeStampOffset);
        //this.length=LocalDateTime.now().until(readTimeStamp,ChronoUnit.SECONDS)*1000;
        batSlotPayload.length=null;
        batSlotPayload.producedInWatsH=msg.payload.acpower;
        batSlotPayload.feededInWatsH=msg.payload.feedinpower;
        batSlotPayload.consumedInWatsH=batSlotPayload.producedInWatsH-batSlotPayload.feededInWatsH;
        this.receivedSlot=new BatterySlot(batSlotPayload);
        this.node.status({fill:"green",shape:"dot",text:"Reporting"});
        if(this.currentSlot!==null){
           
         /// prevent flooding from client with repeated values
         if(this.receivedSlot.readTimeStamp.equals(this.currentSlot.readTimeStamp)){
                this.node.status({fill:"red",shape:"dot",text:"Not fresh data"});
                done();
                return;
            }

            this.currentSlot.calcLenght(this.receivedSlot);
        }else{
            this.currentSlot=this.receivedSlot;
            this.node.status({fill:"green",shape:"dot",text:"Expected next report"});
        }
       
        msg.payload=this.currentSlot.get();
        send(msg);
        this.currentSlot=this.receivedSlot;
        
        done();
    }
}