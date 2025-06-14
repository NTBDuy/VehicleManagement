export default interface Setting {
  settingId: number;
  settingKey: string;
  settingValue: string;
  description?: string;
  settingType?: string;
  createdAt: string;
  updatedAt: string;
}
