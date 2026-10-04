export interface TrackLanguage {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  key: string;
  name: string;
  allowsLanguageSelection: boolean;
  languages: TrackLanguage[];
}
