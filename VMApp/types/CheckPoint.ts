export default interface CheckPoint {
  checkPointId: number;
  requestId: number;
  type: number;
  latitude: number;
  longitude: number;
  photos: [
    {
      photoId: number;
      checkPointId: number;
      name: string;
      filePath: string;
    },
  ];
  note: null;
  createdBy: number;
  createdAt: string;
}
