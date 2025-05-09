
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
    orSeparator: string;
    // Replaced single URL fields with multi-URL fields
    urlsLabel: string; // Was: imageUrlLabel
    urlsPlaceholder: string; // Was: imageUrlPlaceholder
    urlsEmptyError: string; // Was: imageUrlEmptyError
    generateFromUrlsButton: string; // Was: apiGenerateButton
    generatingFromUrlsButton: string; // Was: apiGeneratingButton
    apiError: string; // General API error
    maxWordsLabel: string;
    maxWordsPlaceholder: string;
    errorTitle: string;
    fileTooLargeError: string;
    fileReadError: string;
    selectImageError: string;
    unknownError: string;
    generatingButton: string; // For single file upload
    generateButton: string; // For single file upload
    previewTitle: string;
    imageAltPreview: string; // For single file upload preview
    imageLoadError: string; // For when an image fails to load from URL in batch results
    captionTitle: string; // For single file upload caption
    resultsTitle: string; // For multi-URL results
    imagePreviewAlt: string; // For multi-URL image preview, e.g., "Preview for {{url}}"
    errorForUrl: string; // e.g., "Error for {{url}}: {{errorMessage}}"
    captionForUrl: string; // e.g., "Caption for {{url}}:" - might not be needed if implicit
    captionPlaceholder: string; // General placeholder if needed
    imageAndCaptionPlaceholder: string; // Main placeholder when nothing is loaded
    poweredBy: string;
  };
  // Add other keys as needed
  [key: string]: any; // Allow for nested keys
}

