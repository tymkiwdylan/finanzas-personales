'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, PiggyBank, ChartBar, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-sky-700">BudgetCash</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-sky-600">Características</a>
            <a href="#benefits" className="text-gray-700 hover:text-sky-600">Beneficios</a>
            <a href="#faq" className="text-gray-700 hover:text-sky-600">FAQ</a>
            {user ? (
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <Link 
                href="/auth/login"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
          {/* Mobile login/dashboard button */}
          {user ? (
            <Link 
              href="/dashboard"
              className="md:hidden px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/auth/login"
              className="md:hidden px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
            >
              Acceder
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Maneja tus finanzas con <span className="text-sky-600">control total</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                BudgetCash te ayuda a rastrear tus gastos, gestionar tus ingresos y alcanzar tus metas financieras.
                Simple, intuitivo y potente.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-center rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  >
                    Ir al Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/pricing"
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-center rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                    >
                      Ver planes <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="px-6 py-3 bg-white hover:bg-gray-100 text-sky-600 text-center border border-sky-200 rounded-md transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg bg-white shadow-xl p-2 border border-gray-200">
                <img
                  src="/screenshots/desktop.png"
                  alt="Dashboard de BudgetCash"
                  className="rounded-md w-full"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback in case the image doesn't exist yet
                    e.currentTarget.src = "https://placehold.co/600x400/EDF6FE/0284c7?text=BudgetCash+Dashboard";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Características principales</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<PiggyBank className="h-10 w-10 text-sky-500" />}
              title="Seguimiento de gastos"
              description="Registra y categoriza tus gastos para entender exactamente dónde va tu dinero."
            />
            <FeatureCard 
              icon={<ChartBar className="h-10 w-10 text-sky-500" />}
              title="Análisis y estadísticas"
              description="Visualiza tus patrones de gasto con gráficos intuitivos y reportes detallados."
            />
            <FeatureCard 
              icon={<CreditCard className="h-10 w-10 text-sky-500" />}
              title="Múltiples monedas"
              description="Maneja tus finanzas en diferentes monedas con conversión automática entre ARS y USD."
            />
            <FeatureCard 
              icon={<Settings className="h-10 w-10 text-sky-500" />}
              title="Personalizable"
              description="Adapta ControlCash a tus necesidades específicas con configuraciones flexibles."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Por qué elegir BudgetCash?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              number="01"
              title="Ahorra más"
              description="Identificando patrones de gasto, podrás ajustar tu presupuesto y aumentar tus ahorros mensuales."
            />
            <BenefitCard 
              number="02"
              title="Reduce estrés"
              description="Saber exactamente el estado de tus finanzas reduce la ansiedad y te permite tomar decisiones más informadas."
            />
            <BenefitCard 
              number="03"
              title="Planifica mejor"
              description="Con datos precisos sobre tus hábitos financieros, podrás establecer metas realistas y cumplirlas."
            />
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Comienza a controlar tus finanzas</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Accede a todas las herramientas que necesitas para administrar tu dinero de forma eficiente. <span className="font-semibold text-sky-700">Requiere suscripción.</span></p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-sky-100 transform transition-transform hover:scale-105">
              <div className="bg-sky-600 py-6 px-8 text-white">
                <h3 className="text-xl font-bold">BudgetCash</h3>
                <p className="opacity-90">Gestión financiera personal</p>
              </div>
              
              <div className="p-8">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">Premium</span>
                  <span className="text-lg text-gray-600 ml-2">Con suscripción</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <PricingFeature text="Seguimiento ilimitado de gastos e ingresos" />
                  <PricingFeature text="Reportes y estadísticas detalladas" />
                  <PricingFeature text="Planificación de presupuestos mensuales" />
                  <PricingFeature text="Múltiples monedas con conversión automática" />
                  <PricingFeature text="Recordatorios de pagos recurrentes" />
                  <PricingFeature text="Exportación de datos" />
                  <PricingFeature text="Soporte comunitario" />
                </ul>
                
                <div className="space-y-4">
                  {user ? (
                    <Link 
                      href="/dashboard" 
                      className="block w-full py-3 px-6 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md text-center shadow-sm transition-colors"
                    >
                      Ir al Dashboard
                    </Link>
                  ) : (
                    <Link 
                      href="/auth/register" 
                      className="block w-full py-3 px-6 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md text-center shadow-sm transition-colors"
                    >
                      Comenzar ahora
                    </Link>
                  )}
                  <p className="text-sm text-gray-500 text-center">Sin costos ocultos. Totalmente gratuito.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Preguntas frecuentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="¿Es gratis ControlCash?"
              answer="Sí, ControlCash es completamente gratuito para uso personal. Puedes registrarte y comenzar a utilizar todas sus funciones sin costo alguno."
            />
            <FaqItem 
              question="¿Mis datos están seguros?"
              answer="Absolutamente. Utilizamos encriptación de nivel bancario y nunca compartimos tus datos financieros con terceros."
            />
            <FaqItem 
              question="¿Puedo usar ControlCash en mi celular?"
              answer="Sí, ControlCash está diseñado para funcionar perfectamente en dispositivos móviles con una interfaz adaptada para pantallas pequeñas."
            />
            <FaqItem 
              question="¿Necesito conocimientos financieros para usar ControlCash?"
              answer="No, la aplicación está diseñada para ser intuitiva y fácil de usar, incluso para personas sin experiencia en gestión financiera."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-sky-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Comienza a controlar tus finanzas hoy</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya han tomado control de su futuro financiero con ControlCash.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-white text-sky-600 font-medium rounded-md shadow-lg hover:shadow-xl transition-all inline-flex items-center"
            >
              Ir al Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-white text-sky-600 font-medium rounded-md shadow-lg hover:shadow-xl transition-all inline-flex items-center"
            >
              Crear cuenta gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-4">ControlCash</h3>
              <p className="max-w-md opacity-75">
                La manera más simple de controlar tus finanzas personales y alcanzar la libertad financiera.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Producto</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="hover:text-sky-400 transition-colors">Características</a></li>
                  <li><a href="#benefits" className="hover:text-sky-400 transition-colors">Beneficios</a></li>
                  <li><a href="#faq" className="hover:text-sky-400 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Recursos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-sky-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors">Guías</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors">Soporte</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-sky-400 transition-colors">Términos</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors">Privacidad</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© {new Date().getFullYear()} ControlCash. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="p-6 rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="text-4xl font-bold text-sky-100 mb-4">{number}</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center">
      <div className="rounded-full bg-green-100 p-1 mr-3">
        <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}


