export interface PatientRequest {
    name: string;
    lastname: string;
    email?: string;
    phone: {
        countryCode: string;
        national: string;
        international: string;
        type: string;
        validated: boolean;
    };
    document: {
        number: string;
        type: string;
    };
    addressCountryId?: string;
    addressLocalityId?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComments?: string;
    user: string;
    password: string;
    birthdate: string;
    sex?: string;
    avatarId?: string;
    documentType: string,

}
