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
    orSeparator: string; // Added for "OR" text
    imageUrlLabel: string; // Added for URL input label
    imageUrlPlaceholder: string; // Added for URL input placeholder
    imageUrlEmptyError: string; // Added for URL empty error
    apiGenerateButton: string; // Added for URL submit button
    apiGeneratingButton: string; // Added for URL submit button - loading state
    apiError: string; // Added for URL API error
    errorTitle: string;
    fileTooLargeError: string;
    fileReadError: string;
    selectImageError: string;
    unknownError: string;
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
