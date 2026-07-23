export interface MedicalProviderRequest {
    medicalProviderTypeId: string;
    name: string;
    addressCountryId?: string;
    addressLocalityId?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComments?: string;
    phone: string;
    email: string;
    password: string;
    businessName: string;
    rut: string;
    logoId?: string;
    passwordForgotCode?: string;
    status: string;
}
