export const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

export interface Characteristic {
    uuid: string;
    type: 'NH3' | 'CO' | 'NO2' | 'C3H8' | 'C4H10' | 'CH4' | 'H2' | 'C2H5OH' | 'O2';
}

export const KNOWN_CHARACTERSTICS: Characteristic[] = [
    { uuid: 'beb5483e-36e1-4688-b7f5-ea07361b26a8', type: 'NH3', },
    { uuid: 'a9c871ea-408b-11eb-b378-0242ac130002', type: 'CO', },
    { uuid: '32030236-416e-11eb-b378-0242ac130002', type: 'NO2', },
    { uuid: '378dfe5e-416e-11eb-b378-0242ac130002', type: 'C3H8', },
    { uuid: '3b78a87a-416e-11eb-b378-0242ac130002', type: 'C4H10', },
    { uuid: '42161564-416e-11eb-b378-0242ac130002', type: 'CH4', },
    { uuid: '45cb679a-416e-11eb-b378-0242ac130002', type: 'H2', },
    { uuid: '49c043a2-416e-11eb-b378-0242ac130002', type: 'C2H5OH', },
    { uuid: '4d55b4c0-416e-11eb-b378-0242ac130002', type: 'O2', },
];
