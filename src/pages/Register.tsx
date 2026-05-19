import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, User, Building2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { signUpCustomer, signUpInstaller } from '../services/auth';
import SEO from '../components/seo/SEO';

type Role = 'customer' | 'installer';

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen haben.');
      return;
    }
    if (!agreeTerms) {
      setError('Bitte akzeptiere die AGB und Datenschutzerklärung.');
      return;
    }

    setIsLoading(true);
    try {
      if (role === 'customer') {
        const fullName = `${firstName} ${lastName}`.trim();
        await signUpCustomer(email, password, fullName);
      } else {
        const fullName = companyName || `${firstName} ${lastName}`.trim();
        await signUpInstaller(email, password, fullName, zip, phone || undefined);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Registrierung" description="Erstellen Sie Ihr Voltify-Konto — als Privatkunde oder Installateur." canonical="/register" noindex />
      <div className="min-h-screen flex">
      {/* LEFT - Register Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
          </div>
          <span className="text-lg font-medium text-[#1A3A5C]">Voltify</span>
        </Link>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1A3A5C] mb-3">Create Account</h1>
          <p className="text-gray-500 text-sm mb-8">Fill in your details to get started with Voltify.</p>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <h2 className="text-xl font-bold text-[#1A3A5C]">Konto erstellt!</h2>
              <p className="text-gray-500 text-sm">
                {role === 'customer'
                  ? 'Bitte bestätige deine E-Mail-Adresse. Danach kannst du dich anmelden.'
                  : 'Wir melden uns innerhalb von 24 Stunden bei dir. Dein Konto wird nach Prüfung freigeschaltet.'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 bg-[#1A3A5C] text-white font-medium px-6 py-3 rounded-xl hover:bg-[#0F2440] transition-colors"
              >
                Zum Login
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Ich bin...</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      role === 'customer'
                        ? 'border-[#1A3A5C] bg-[#1A3A5C]/5 text-[#1A3A5C]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Privatkunde
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('installer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      role === 'installer'
                        ? 'border-[#1A3A5C] bg-[#1A3A5C]/5 text-[#1A3A5C]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Fachbetrieb
                  </button>
                </div>
              </div>

              {/* Customer Fields */}
              {role === 'customer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Vorname</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Max"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Nachname</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mustermann"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Installer Fields */}
              {role === 'installer' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">Firmenname</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Dein Unternehmen GmbH"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">PLZ</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="12345"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Telefon</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+49 171 1234567"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@voltify.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    required
                    minLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1A3A5C] focus:ring-[#1A3A5C]"
                />
                <span className="text-xs text-gray-500">
                  Ich akzeptiere die{' '}
                  <Link to="/agb" className="text-[#1A3A5C] font-medium hover:underline">AGB</Link>
                  {' '}und die{' '}
                  <Link to="/datenschutz" className="text-[#1A3A5C] font-medium hover:underline">Datenschutzerklärung</Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A3A5C] text-white font-medium py-3 rounded-xl hover:bg-[#0F2440] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Konto wird erstellt…' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        {/* Bottom */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already Have An Account? <Link to="/login" className="text-[#1A3A5C] font-medium hover:underline">Login Now.</Link>
        </p>
      </div>

      {/* RIGHT - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-[#1A3A5C] via-[#0F2440] to-black items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#F5A623]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#1A3A5C]/40 rounded-full blur-3xl" />

        <div className="relative max-w-[540px] w-full">
          {/* Tagline */}
          <h2 className="text-3xl font-semibold text-white mb-2 leading-snug">
            Start your solar journey<br />with confidence.
          </h2>
          <p className="text-white/60 text-sm mb-8">Create an account to access all features and manage your solar projects.</p>

          {/* Dashboard Mockup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-[10px] text-white/60 mb-1">ROI Potential</p>
                <p className="text-lg font-bold text-white">24.5%</p>
                <span className="text-[10px] text-[#F5A623]">+5% vs last year</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-[10px] text-white/60 mb-1">Panel Efficiency</p>
                <p className="text-lg font-bold text-white">21.8%</p>
                <span className="text-[10px] text-[#F5A623]">Top tier</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-[10px] text-white/60 mb-1">Payback Time</p>
                <p className="text-lg font-bold text-white">7.2 yrs</p>
                <span className="text-[10px] text-[#F5A623]">Above average</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white font-medium">Savings Projection</span>
                <div className="flex gap-1">
                  <span className="text-[10px] text-white/40 px-2 py-0.5 rounded bg-white/10">Yearly</span>
                  <span className="text-[10px] text-white/40 px-2 py-0.5">Monthly</span>
                </div>
              </div>
              <svg viewBox="0 0 400 120" className="w-full h-24">
                <defs>
                  <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A623" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#F5A623" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 110 Q50 90 100 75 T200 45 T300 35 T400 15 L400 120 L0 120 Z" fill="url(#chartGrad2)" />
                <path d="M0 110 Q50 90 100 75 T200 45 T300 35 T400 15" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="0" cy="110" r="4" fill="#F5A623" />
                <circle cx="100" cy="75" r="4" fill="#F5A623" />
                <circle cx="200" cy="45" r="4" fill="#F5A623" />
                <circle cx="300" cy="35" r="4" fill="#F5A623" />
                <circle cx="400" cy="15" r="4" fill="#F5A623" />
              </svg>
            </div>

            {/* Bottom Cards */}
            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F5A623" strokeWidth="8" strokeLinecap="round" strokeDasharray="175 251" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">70%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Carbon Offset</p>
                  <p className="text-[10px] text-white/50">Yearly target</p>
                </div>
              </div>
              <div className="w-[140px] bg-white/10 rounded-xl p-3">
                <p className="text-[10px] text-white/60 mb-1">Configurations</p>
                <p className="text-2xl font-bold text-white">3</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">2 Saved</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">1 Draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
