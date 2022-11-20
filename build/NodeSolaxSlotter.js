"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeSolaxSlotter = void 0;
const BatterySlot_js_1 = require("@virtualbat/entities/dist/src/BatterySlot.js");
const core_1 = require("@js-joda/core");
class NodeSolaxSlotter {
    constructor(node) {
        this.currentSlot = null;
        this.receivedSlot = null;
        this.node = null;
        this.node = node;
    }
    onInput(msg, send, done) {
        let dateTimeformater = core_1.DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss');
        let batSlotPayload = {};
        batSlotPayload.readTimeStamp = core_1.LocalDateTime.parse(msg.payload.uploadTime, dateTimeformater).plusHours(1);
        //this.length=LocalDateTime.now().until(readTimeStamp,ChronoUnit.SECONDS)*1000;
        batSlotPayload.length = null;
        batSlotPayload.producedInWatsH = msg.payload.acpower;
        batSlotPayload.feededInWatsH = msg.payload.feedinpower;
        batSlotPayload.consumedInWatsH = batSlotPayload.producedInWatsH - batSlotPayload.feededInWatsH;
        this.receivedSlot = new BatterySlot_js_1.BatterySlot(batSlotPayload);
        this.node.status({ fill: "green", shape: "dot", text: "Reporting" });
        if (this.currentSlot !== null) {
            /// prevent flooding from client with repeated values
            if (this.receivedSlot.readTimeStamp.equals(this.currentSlot.readTimeStamp)) {
                this.node.status({ fill: "red", shape: "dot", text: "Not fresh data" });
                done();
                return;
            }
            this.currentSlot.calcLenght(this.receivedSlot);
        }
        else {
            this.currentSlot = this.receivedSlot;
            this.node.status({ fill: "green", shape: "dot", text: "Expected next report" });
        }
        msg.payload = this.currentSlot.get();
        send(msg);
        this.currentSlot = this.receivedSlot;
        done();
    }
}
exports.NodeSolaxSlotter = NodeSolaxSlotter;
