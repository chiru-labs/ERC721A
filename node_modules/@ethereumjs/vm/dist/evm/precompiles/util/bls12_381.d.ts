/// <reference types="node" />
declare function BLS12_381_ToG1Point(input: Buffer, mcl: any): any;
declare function BLS12_381_FromG1Point(input: any): Buffer;
declare function BLS12_381_ToG2Point(input: Buffer, mcl: any): any;
declare function BLS12_381_FromG2Point(input: any): Buffer;
declare function BLS12_381_ToFrPoint(input: Buffer, mcl: any): any;
declare function BLS12_381_ToFpPoint(fpCoordinate: Buffer, mcl: any): any;
declare function BLS12_381_ToFp2Point(fpXCoordinate: Buffer, fpYCoordinate: Buffer, mcl: any): any;
export { BLS12_381_ToG1Point, BLS12_381_FromG1Point, BLS12_381_ToG2Point, BLS12_381_FromG2Point, BLS12_381_ToFrPoint, BLS12_381_ToFpPoint, BLS12_381_ToFp2Point, };
