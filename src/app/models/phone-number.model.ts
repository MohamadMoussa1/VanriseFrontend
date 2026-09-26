export interface PhoneNumber {
  id: number;
  number: string;
  device: string; // Returned as device Name from GET APIs
}

export interface CreatePhoneNumberDto {
  number: string;
  deviceId: number;
}

export interface UpdatePhoneNumberDto {
  id: number;
  number: string;
  deviceId: number;
}
