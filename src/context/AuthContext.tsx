import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, SubscriptionInfo, CVData, StyleConfig, SavedResume } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isPremium: boolean;
  subscription: SubscriptionInfo;
  login: (email: string, pass: string) => Promise<void>;
  registerThreeStep: (params: {
    // Step 1: Credentials
    email: string;
    pass: string;
    fullName: string;
    // Step 2: Details & Context
    phoneNumber: string;
    cityProvince: string;
    careerField: string;
    experienceLevel: UserProfile['experienceLevel'];
    // Step 3: Terms & Security
    termsAccepted: boolean;
    privacyAccepted: boolean;
    marketingConsent: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPremiumStatus: (isPremium: boolean, expiresAt?: string | null) => Promise<void>;
  saveUserResume: (cvData: CVData, styleConfig: StyleConfig, title?: string) => Promise<string>;
  loadUserResumes: () => Promise<SavedResume[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'cv_moz_user_session';
const LOCAL_CRED_STORE_KEY = 'cv_moz_user_creds';

async function hashPassword(pass: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(pass);
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
      hash = (hash << 5) - hash + pass.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36) + pass.length;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    isActive: false,
    planName: 'Gratuito',
    expiresAt: null,
    priceMzn: 0,
  });

  const fetchUserProfile = async (uid: string, defaultEmail?: string, defaultName?: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        if (data.isPremium) {
          setIsPremium(true);
          setSubscription({
            isActive: true,
            planName: 'Acesso Ilimitado Pro',
            expiresAt: data.premiumExpiresAt || null,
            priceMzn: 299,
          });
        } else {
          setIsPremium(false);
          setSubscription({
            isActive: false,
            planName: 'Gratuito',
            expiresAt: null,
            priceMzn: 0,
          });
        }
      } else {
        // Fallback profile if created externally
        const fallback: UserProfile = {
          uid,
          email: defaultEmail || '',
          displayName: defaultName || 'Utilizador',
          phoneNumber: '',
          cityProvince: 'Maputo',
          careerField: 'Geral',
          experienceLevel: 'Júnior (1-3 anos)',
          termsAccepted: true,
          privacyAccepted: true,
          registeredAt: new Date().toISOString(),
          isPremium: false,
        };
        await setDoc(userRef, fallback);
        setUserProfile(fallback);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isSubscribed) {
          setCurrentUser(user);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
          await fetchUserProfile(user.uid, user.email || '', user.displayName || '');
        }
      } else {
        // Check if there is a local session active
        const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.uid) {
              const syntheticUser: any = {
                uid: parsed.uid,
                email: parsed.email,
                displayName: parsed.displayName,
              };
              if (isSubscribed) {
                setCurrentUser(syntheticUser);
                await fetchUserProfile(parsed.uid, parsed.email, parsed.displayName);
              }
            }
          } catch (e) {
            console.error('Error parsing local session:', e);
          }
        }
      }
      if (isSubscribed) {
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      throw new Error('Por favor, preencha o seu e-mail e a sua palavra-passe.');
    }

    const hashedInput = await hashPassword(pass);

    // 1. Try Firebase Auth first
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName
      }));
      await fetchUserProfile(res.user.uid, res.user.email || '', res.user.displayName || '');
      return;
    } catch (fbErr: any) {
      console.warn('Firebase direct login note:', fbErr?.code || fbErr?.message);

      // CRITICAL SECURITY CHECK:
      // If Firebase Auth specifically rejected the credentials, DO NOT BYPASS IT!
      // This happens when the account exists and the password entered is wrong.
      if (
        fbErr.code === 'auth/wrong-password' ||
        fbErr.code === 'auth/invalid-credential' ||
        fbErr.code === 'auth/invalid-login-credentials'
      ) {
        throw new Error('Palavra-passe incorreta. Por favor verifique e tente novamente.');
      }

      if (fbErr.code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas falhadas. A sua conta foi temporariamente bloqueada por segurança. Tente mais tarde ou redefina a senha.');
      }

      if (fbErr.code === 'auth/user-disabled') {
        throw new Error('Esta conta foi desativada pelo administrador.');
      }

      if (fbErr.code === 'auth/invalid-email') {
        throw new Error('O formato do e-mail inserido é inválido.');
      }
    }

    // 2. Query Firestore users collection for matching email (for offline or synced accounts)
    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const foundDoc = querySnap.docs[0];
        const profileData = foundDoc.data() as UserProfile;
        
        let isPasswordVerified = false;

        // Verify passwordHash if available on profile
        if (profileData.passwordHash) {
          if (profileData.passwordHash === hashedInput) {
            isPasswordVerified = true;
          } else {
            throw new Error('Palavra-passe incorreta. Por favor verifique e tente novamente.');
          }
        }

        // Check local credential store for password match
        const credsRaw = localStorage.getItem(LOCAL_CRED_STORE_KEY);
        if (credsRaw) {
          try {
            const credsMap = JSON.parse(credsRaw);
            const stored = credsMap[cleanEmail];
            if (stored) {
              if (stored === pass || stored === hashedInput) {
                isPasswordVerified = true;
              } else {
                throw new Error('Palavra-passe incorreta. Por favor verifique e tente novamente.');
              }
            }
          } catch (err: any) {
            if (err.message?.includes('Palavra-passe')) throw err;
          }
        }

        // If password was never verified, reject!
        if (!isPasswordVerified) {
          throw new Error('Palavra-passe incorreta. Por favor verifique a sua senha.');
        }

        const syntheticUser: any = {
          uid: profileData.uid,
          email: profileData.email,
          displayName: profileData.displayName,
        };
        setCurrentUser(syntheticUser);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(syntheticUser));
        await fetchUserProfile(profileData.uid, profileData.email, profileData.displayName);
        return;
      }
    } catch (firestoreErr: any) {
      if (firestoreErr.message?.includes('Palavra-passe')) {
        throw firestoreErr;
      }
      console.warn('Firestore fallback check:', firestoreErr);
    }

    // 3. Check local credential store as emergency fallback
    const credsRaw = localStorage.getItem(LOCAL_CRED_STORE_KEY);
    if (credsRaw) {
      try {
        const credsMap = JSON.parse(credsRaw);
        if (credsMap[cleanEmail]) {
          const stored = credsMap[cleanEmail];
          if (stored !== pass && stored !== hashedInput) {
            throw new Error('Palavra-passe incorreta. Por favor tente novamente.');
          }
          const uid = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
          const syntheticUser: any = {
            uid,
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
          };
          setCurrentUser(syntheticUser);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(syntheticUser));
          await fetchUserProfile(uid, cleanEmail, syntheticUser.displayName);
          return;
        }
      } catch (err: any) {
        if (err.message?.includes('Palavra-passe')) throw err;
      }
    }

    throw new Error('Não foi encontrada nenhuma conta com este e-mail. Por favor, crie uma conta primeiro.');
  };

  const registerThreeStep = async (params: {
    email: string;
    pass: string;
    fullName: string;
    phoneNumber: string;
    cityProvince: string;
    careerField: string;
    experienceLevel: UserProfile['experienceLevel'];
    termsAccepted: boolean;
    privacyAccepted: boolean;
    marketingConsent: boolean;
  }) => {
    if (!params.termsAccepted || !params.privacyAccepted) {
      throw new Error('É obrigatório aceitar os Termos de Serviço e Política de Privacidade para prosseguir.');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.fullName.trim();
    let finalUid = '';

    // 1. Try Firebase Auth User Creation
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, params.pass);
      finalUid = res.user.uid;
      await updateProfile(res.user, {
        displayName: cleanName,
      });
    } catch (fbErr: any) {
      console.warn('Firebase Auth creation notice (activating unified DB account):', fbErr?.code || fbErr?.message);
      
      if (fbErr.code === 'auth/email-already-in-use') {
        const customErr: any = new Error('Este e-mail já se encontra registado. Experimente iniciar sessão.');
        customErr.code = 'auth/email-already-in-use';
        throw customErr;
      }

      if (fbErr.code === 'auth/weak-password') {
        const customErr: any = new Error('A palavra-passe deve conter no mínimo 6 caracteres.');
        customErr.code = 'auth/weak-password';
        throw customErr;
      }

      if (fbErr.code === 'auth/invalid-email') {
        const customErr: any = new Error('O formato de e-mail é inválido.');
        customErr.code = 'auth/invalid-email';
        throw customErr;
      }

      // If auth provider is disabled or network error, create deterministic secure UID
      finalUid = 'mz_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 18) + '_' + Date.now().toString(36);
    }

    const hashedPass = await hashPassword(params.pass);

    // 2. Build full UserProfile document
    const newProfile: UserProfile = {
      uid: finalUid,
      email: cleanEmail,
      displayName: cleanName,
      phoneNumber: params.phoneNumber.trim(),
      cityProvince: params.cityProvince.trim(),
      careerField: params.careerField.trim(),
      experienceLevel: params.experienceLevel,
      termsAccepted: true,
      privacyAccepted: true,
      marketingConsent: params.marketingConsent,
      registeredAt: new Date().toISOString(),
      passwordHash: hashedPass,
      isPremium: false,
      lastActiveAt: new Date().toISOString(),
    };

    // 3. Store credentials securely for fallback sign-in
    try {
      const credsRaw = localStorage.getItem(LOCAL_CRED_STORE_KEY) || '{}';
      const credsMap = JSON.parse(credsRaw);
      credsMap[cleanEmail] = hashedPass;
      localStorage.setItem(LOCAL_CRED_STORE_KEY, JSON.stringify(credsMap));
    } catch (e) {
      console.error('Error storing fallback creds:', e);
    }

    // 4. Save to Firestore
    try {
      await setDoc(doc(db, 'users', finalUid), newProfile);
    } catch (e) {
      console.error('Error saving user profile in Firestore:', e);
    }

    // 5. Generate AI tailored CV based on user profession & experience level
    try {
      const aiRes = await fetch('/api/ai/generate-tailored-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          careerField: params.careerField,
          experienceLevel: params.experienceLevel,
          location: params.cityProvince,
          email: cleanEmail,
          phone: params.phoneNumber,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.success && aiData.cvData) {
        const resumeId = `cv-${finalUid}`;
        const initialResume: SavedResume = {
          id: resumeId,
          userId: finalUid,
          title: `${cleanName} - ${params.careerField}`,
          cvData: aiData.cvData,
          styleConfig: {
            template: 'modern',
            colorScheme: 'emerald',
            fontFamily: 'sans',
            spacing: 'normal',
            showPhoto: true,
            showSkillBars: true,
          },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'resumes', resumeId), initialResume);
        localStorage.setItem(`cv_cache_${finalUid}`, JSON.stringify(initialResume));
        localStorage.setItem('cv_mz_data_v1', JSON.stringify(aiData.cvData));
      }
    } catch (aiErr) {
      console.warn('AI tailored CV generation notice:', aiErr);
    }

    const syntheticUser: any = {
      uid: finalUid,
      email: cleanEmail,
      displayName: cleanName,
    };

    setCurrentUser(syntheticUser);
    setUserProfile(newProfile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(syntheticUser));
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setCurrentUser(null);
    setUserProfile(null);
    setIsPremium(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e) {
      console.warn('Password reset notification:', e);
    }
  };

  const updateUserPremiumStatus = async (premium: boolean, expiresAt: string | null = null) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isPremium: premium,
        premiumExpiresAt: expiresAt,
        lastActiveAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error updating premium status in Firestore:', e);
    }

    setIsPremium(premium);
    setSubscription({
      isActive: premium,
      planName: premium ? 'Acesso Ilimitado Pro' : 'Gratuito',
      expiresAt,
      priceMzn: premium ? 299 : 0,
    });
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        isPremium: premium,
        premiumExpiresAt: expiresAt,
      });
    }
  };

  const saveUserResume = async (cvData: CVData, styleConfig: StyleConfig, title?: string): Promise<string> => {
    if (!currentUser) throw new Error('Utilizador não autenticado');
    const resumeId = `cv-${currentUser.uid}`;
    const resumeData: SavedResume = {
      id: resumeId,
      userId: currentUser.uid,
      title: title || `${cvData.personal.fullName || 'Meu Currículo'} - ${cvData.personal.jobTitle || 'CV'}`,
      cvData,
      styleConfig,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'resumes', resumeId), resumeData);
    } catch (e) {
      console.error('Error saving resume to Firestore:', e);
      // Fallback local resume cache
      localStorage.setItem(`cv_cache_${currentUser.uid}`, JSON.stringify(resumeData));
    }
    return resumeId;
  };

  const loadUserResumes = async (): Promise<SavedResume[]> => {
    if (!currentUser) return [];
    try {
      const q = query(collection(db, 'resumes'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as SavedResume);
      }
    } catch (e) {
      console.error('Failed to load user resumes from Firestore:', e);
    }

    // Check local fallback
    const cached = localStorage.getItem(`cv_cache_${currentUser.uid}`);
    if (cached) {
      try {
        return [JSON.parse(cached)];
      } catch (err) {
        console.error('Error parsing cached resume:', err);
      }
    }
    return [];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isPremium,
        subscription,
        login,
        registerThreeStep,
        logout,
        resetPassword,
        updateUserPremiumStatus,
        saveUserResume,
        loadUserResumes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

