import { useEffect } from 'react';
import { Asset } from 'expo-asset';

export const usePreloadAssets = () => {
  useEffect(() => {
    const loadAssets = async () => {
      const images = [
        require('@/assets/images/VMS.png'),
        require('@/assets/images/image-deleted.png'),
        require('@/assets/images/user-default.jpg'),
      ];

      try {
        await Promise.all(images.map((img) => Asset.fromModule(img).downloadAsync()));
        console.log('Tải trước tất cả asset thành công!');
      } catch (error) {
        console.error('Tải asset thất bại:', error);
      }
    };

    loadAssets();
  }, []);
};
