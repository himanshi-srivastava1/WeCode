import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;
let bootPromise = null; // This is the "Lock"

export const getWebContainer = async () => {
  if (webcontainerInstance) return webcontainerInstance;

  // If a boot is already in progress, return that existing promise
  if (bootPromise) return bootPromise;

  // Start the boot and store the promise so others can wait for it
  bootPromise = WebContainer.boot().then((instance) => {
    webcontainerInstance = instance;
    return instance;
  });

  return bootPromise;
};