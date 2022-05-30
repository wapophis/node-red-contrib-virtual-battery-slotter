# NODE-RED VIRTUAL-BATTERY SOLAX SLOTTER
This node get readings from solax inverter and convert it to a virtual battery slot. 
It can be replaced by a Function node which make the neede transformations to get the following output format. 


|OUTPUT PAYLOAD | DESCRIPTION
|---------------|:------------:|
| readTimeStamp | TimeStamp of the adquired reading from the inverter, usually inverters send this field in the readings. ISO FORMATTED DATE STRING [2022-05-30T14:48:54].|
|length         | Battery slot lenght in ms. |
|producedInWatsH| Solar plant energy generation. Unit of measure: Wat per Hour|
|feededInWatsH  | Feeded energy to the main network, positive values means solar to main network feeding. Negative values means main network to home feeding. Unit of measure: Wat per Hour |
|consumedInWatsH| Consumed energy, formally the diference between producedInWatH and feededInWatsH. Unit of measure: Wat per Hour
