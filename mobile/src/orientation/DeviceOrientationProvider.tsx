import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

const DeviceOrientationContext = createContext(false);

function isLandscapeOrientation(
  orientation: ScreenOrientation.Orientation,
): boolean {
  return (
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
  );
}

export function DeviceOrientationProvider({
  children,
}: PropsWithChildren) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    let receivedOrientationChange = false;
    const subscription = ScreenOrientation.addOrientationChangeListener(
      ({ orientationInfo }) => {
        receivedOrientationChange = true;
        setIsLandscape(isLandscapeOrientation(orientationInfo.orientation));
      },
    );

    ScreenOrientation.getOrientationAsync()
      .then((orientation) => {
        if (!receivedOrientationChange) {
          setIsLandscape(isLandscapeOrientation(orientation));
        }
      })
      .catch((error: unknown) => {
        console.warn('Could not read device screen orientation.', error);
      });

    return () => subscription.remove();
  }, []);

  return (
    <DeviceOrientationContext.Provider value={isLandscape}>
      {children}
    </DeviceOrientationContext.Provider>
  );
}

export function useDeviceOrientation(): boolean {
  return useContext(DeviceOrientationContext);
}
