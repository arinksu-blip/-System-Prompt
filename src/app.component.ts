import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';

export type ActionType = 'translate' | 'improve' | 'simplify' | 'academize' | 'paraphrase' | 'summarize';

interface Action {
  id: ActionType;
  label: string;
  icon: string; // SVG path
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  inputText = signal<string>('Angular to potężny framework do tworzenia aplikacji internetowych. Umożliwia budowanie skalowalnych i wydajnych rozwiązań, wykorzystując architekturę opartą na komponentach.');
  outputText = signal<string>('');
  selectedAction = signal<ActionType>('improve');
  targetLanguage = signal<string>('English');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  copyButtonText = signal<string>('Kopiuj');

  actions: Action[] = [
    { id: 'improve', label: 'Ulepsz', icon: 'M12 6.252l1.32.545 1.39-1.28-1.07 2.15 2.29.07-1.89 1.5.83 2.05-2.22-.55-1.57 1.8-1.01-2.02-2.18.5 1.02-2.12-1.7-1.45 2.3.1.2-2.15-1.39-1.34 1.32-.55z' },
    { id: 'paraphrase', label: 'Parafrazuj', icon: 'M7 7h10v10H7v-3l-4 4 4 4v-3h12V5H7v2l-4-4 4-4v2z' },
    { id: 'summarize', label: 'Streść', icon: 'M4 6h16M4 12h12M4 18h8' },
    { id: 'simplify', label: 'Uprość', icon: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z' },
    { id: 'academize', label: 'Akademizuj', icon: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.18v4L12 21l7-3.82v-4L12 17l-7-3.82z' },
    { id: 'translate', label: 'Przetłumacz', icon: 'M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z' },
  ];
  
  languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Polish', 'Russian', 'Chinese', 'Japanese'
  ];

  selectAction(action: ActionType): void {
    this.selectedAction.set(action);
  }

  async processText(): Promise<void> {
    const text = this.inputText().trim();
    if (!text) {
      this.error.set('Proszę wpisać tekst do przetworzenia.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.outputText.set('');
    this.copyButtonText.set('Kopiuj');

    try {
      const action = this.selectedAction();
      let prompt = '';

      switch (action) {
        case 'translate':
          prompt = `Przetłumacz poniższy tekst na język ${this.targetLanguage()}. Zwróć tylko przetłumaczony tekst, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do przetłumaczenia:\n"${text}"`;
          break;
        case 'improve':
          prompt = `Ulepsz poniższy tekst: popraw gramatykę, styl, jasność i płynność. Zachowaj oryginalny sens. Zwróć tylko ulepszony tekst, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do ulepszenia:\n"${text}"`;
          break;
        case 'simplify':
          prompt = `Uprość poniższy tekst, aby był łatwiejszy do zrozumienia. Zachowaj oryginalny sens. Zwróć tylko uproszczony tekst, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do uproszczenia:\n"${text}"`;
          break;
        case 'academize':
          prompt = `Nadaj poniższemu tekstowi formalny, naukowy charakter. Zachowaj oryginalny sens. Zwróć tylko zredagowany tekst, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do akademizacji:\n"${text}"`;
          break;
        case 'paraphrase':
          prompt = `Sparafrazuj poniższy tekst, używając innych słów, ale zachowując ten sam sens. Zwróć tylko sparafrazowany tekst, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do sparafrazowania:\n"${text}"`;
          break;
        case 'summarize':
          prompt = `Streść poniższy tekst. Zwróć tylko streszczenie, bez żadnych dodatkowych komentarzy i wyjaśnień.\n\nTekst do streszczenia:\n"${text}"`;
          break;
      }
      
      const result = await this.geminiService.generateText(prompt);
      this.outputText.set(result.trim());
    } catch (e: any) {
      this.error.set(e.message || 'Wystąpił nieoczekiwany błąd.');
    } finally {
      this.isLoading.set(false);
    }
  }

  copyToClipboard(): void {
    const text = this.outputText();
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.copyButtonText.set('Skopiowano!');
        setTimeout(() => this.copyButtonText.set('Kopiuj'), 2000);
      }, () => {
        this.error.set('Nie udało się skopiować tekstu.');
      });
    }
  }
}
