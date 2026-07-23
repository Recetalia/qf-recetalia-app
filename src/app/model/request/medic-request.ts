export interface MedicRequest {
    id: string;
    name: string;
    lastname: string;
    gender?: string;
    email: string;
    password: string; // Add this if you'll be sending passwords in the request
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
    birthdate: string;
    addressCountryId?: string;
    addressLocalityId?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComments?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: any;
    cjp: string;
    status: string;
    especialityId?: string;
    medicalProviderId?: string;
    info: string;
}
