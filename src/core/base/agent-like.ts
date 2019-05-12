import { Signature } from './signature';
import { InputPin, OutputPin } from './io';
import { SignalPin } from './control';


export interface AgentLike {
  input?(tag: string): InputPin<any>;
  output?(tag: string): OutputPin<any>;
  signal?(tag: string): SignalPin;

  signature: Signature;
}
