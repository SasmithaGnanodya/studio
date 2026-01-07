import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { Field } from '@/types';

type GeneratedPdfDocumentProps = {
  pageImages: string[];
  pageDimensions: {width: number, height: number}[];
  fields: Field[];
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fieldView: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    display: 'flex',
    flexWrap: 'wrap',
  },
  fieldText: {
    fontSize: 10,
  }
});

export const GeneratedPdfDocument: React.FC<GeneratedPdfDocumentProps> = ({ pageImages, pageDimensions, fields }) => (
  <Document>
    {pageImages.map((imageSrc, index) => {
      const pageNumber = index + 1;
      const dimensions = pageDimensions[index] || {width: 595.28, height: 841.89};

      return (
        <Page key={`page_${pageNumber}`} size={[dimensions.width, dimensions.height]} style={styles.page}>
          <Image src={imageSrc} style={styles.backgroundImage} />
          
          {fields.filter(f => f.page === pageNumber).map(field => {
            const fieldStyle = {
              left: `${field.x}%`,
              top: `${field.y}%`,
              width: `${field.width}%`,
              height: `${field.height}%`,
              padding: '2pt',
            };

            return (
              <View key={field.id} style={[styles.fieldView, fieldStyle]}>
                <Text style={styles.fieldText}>
                  {field.value}
                </Text>
              </View>
            );
          })}
        </Page>
      );
    })}
  </Document>
);