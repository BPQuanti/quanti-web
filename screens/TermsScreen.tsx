import { termsOfService } from '../constants/legal';
import LegalDocumentScreen from './LegalDocumentScreen';

export default function TermsScreen() {
  return <LegalDocumentScreen document={termsOfService} />;
}
