import { privacyPolicy } from '../constants/legal';
import LegalDocumentScreen from './LegalDocumentScreen';

export default function PrivacyScreen() {
  return <LegalDocumentScreen document={privacyPolicy} />;
}
