/**
 * @fileOverviewDefines internationalization-related types.
 */

export type Locale = 'en' | 'fr';

export interface Translations {
  meta: {
    title: string;
    description: string;
  };
  homePage: {
    title: string;
    subtitle: string;
    footer: string;
    allRightsReserved: string;
  };
  imageCaptioningForm: {
    cardTitle: string;
    cardDescription: string;
    uploadLabel: string;
    uploadMaxSize: string;
    uploadClick: string;
    uploadDragAndDrop: string;
    uploadSelectedFile: string;
    uploadSupportedFormats: string;
    errorTitle: string;
    fileTooLargeError: string;
    fileReadError: string;
    selectImageError: string;
    unknownError: string; // Added this line
    generatingButton: string;
    generateButton: string;
    previewTitle: string;
    imageAltPreview: string;
    captionTitle: string;
    captionPlaceholder: string;
    imageAndCaptionPlaceholder: string;
    poweredBy: string;
  };
  // Add other keys as needed
  [key: string]: any; // Allow for nested keys
}
