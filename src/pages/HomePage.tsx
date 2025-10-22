import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineCheckCircle,
  AiOutlineBell,
  AiOutlineBarChart,
  AiOutlineSafety
} from 'react-icons/ai';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const primaryFeatures = [
    {
      icon: AiOutlineCalendar,
      title: 'Plan Every Detail',
      description: 'Host immersive event pages, manage RSVPs, and keep schedules in sync without juggling multiple tools.',
      accent: 'border border-border/70 bg-background/70 text-text',
      tag: 'Scheduler'
    },
    {
      icon: AiOutlineTeam,
      title: 'Build Strong Teams',
      description: 'Connect students with the right collaborators, manage team roles, and centralize conversations effortlessly.',
      accent: 'border border-border/70 bg-background/70 text-text',
      tag: 'Collaboration'
    },
    {
      icon: AiOutlineBell,
      title: 'Stay in the Loop',
      description: 'Send tailored updates, nudges, and reminders so everyone knows what is happening next.',
      accent: 'border border-border/70 bg-background/70 text-text',
      tag: 'Signals'
    }
  ];

  const experienceSteps = [
    {
      title: 'Kick Things Off',
      description: 'Draft a polished event blueprint with timelines, capacities, and key collaborators laid out before the first announcement.',
      icon: AiOutlineCalendar,
      tag: 'Launch',
      accent: 'bg-neutral-800/10 text-text'
    },
    {
      title: 'Collaborate Live',
      description: 'Assign responsibilities, track approvals, and keep context-rich conversations inside one shared workspace.',
      icon: AiOutlineTeam,
      tag: 'Collaborate',
      accent: 'bg-neutral-700/10 text-text'
    },
    {
      title: 'Deliver the Moment',
      description: 'Send precise notifications, gather instant feedback, and ship a recap ready to inspire your next program.',
      icon: AiOutlineBell,
      tag: 'Celebrate',
      accent: 'bg-neutral-600/10 text-text'
    }
  ];

  const audienceHighlights = [
    {
      title: 'For Students',
      description: 'Find the experiences that matter, reserve your seat, and bring your crew along without the inbox overload.',
      bullets: ['Personalized event feed', 'Instant team invites', 'Unified task list across events'],
      accent: 'border-border/80 bg-background/65'
    },
    {
      title: 'For Organizers',
      description: 'Design richer programs, collect insights in real time, and keep every stakeholder informed with zero guesswork.',
      bullets: ['Modular registration flows', 'Real-time engagement signals', 'Templates for recurring series'],
      accent: 'border-border/80 bg-background/65'
    }
  ];



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
            <div className="space-y-12 animate-fade-in">
              <div className="flex items-center gap-4 text-[0.55rem] uppercase tracking-[0.5em] text-text-secondary">
                <span>EMS</span>
                <span className="h-px flex-1 bg-border"></span>
                <span>Campus Control</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-semibold leading-tight text-text">
                  Event Management System
                </h1>
                <p className="text-lg lg:text-xl text-text-secondary max-w-xl">
                  EMS gives organisers and students a single, distraction-free canvas to plan, align, and deliver
                  events without the usual noise. Everything you need, nothing you don’t.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-surface/90 p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-semibold text-text">
                    <AiOutlineCalendar className="w-5 h-5" />
                    Seamless planning
                  </div>
                  <p className="text-sm text-text-secondary">
                    Build itineraries, manage RSVPs, and preview your event flow in a single neutral view.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface/90 p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-semibold text-text">
                    <AiOutlineTeam className="w-5 h-5" />
                    Unified teams
                  </div>
                  <p className="text-sm text-text-secondary">
                    Give collaborators instant access to decisions, tasks, and shared updates.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-text px-7 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-background transition-colors duration-200 hover:bg-background hover:text-text"
                >
                  Create Your Space
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-text-secondary transition-colors duration-200 hover:bg-background hover:text-text"
                >
                  Explore the Demo
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="absolute -left-4 -top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent)] blur-2xl"></div>
              <div className="absolute right-4 bottom-4 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent)] blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 rounded-3xl border border-border/60 bg-background/50 backdrop-blur-sm"></div>
                <div className="relative rounded-3xl border border-border bg-background/90 p-8 backdrop-blur">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-text-secondary">
                    <span>Live overview</span>
                    <span>EMS</span>
                  </div>
                  <div className="mt-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                          <AiOutlineCalendar className="w-5 h-5 text-text" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text">Launch Week Mixer</p>
                          <p className="text-xs text-text-secondary">Friday · 6:00 PM · Auditorium</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">In review</span>
                    </div>

                    <div className="rounded-2xl border border-border p-5 space-y-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-text">
                        <AiOutlineTeam className="w-5 h-5" />
                        Crew sync
                      </div>
                      <div className="space-y-3 text-sm text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span>Volunteers onboarded</span>
                          <span className="text-text">08 / 10</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Session briefs</span>
                          <span className="text-text">Ready</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5 space-y-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-text">
                        <AiOutlineBell className="w-5 h-5" />
                        Quiet reminders
                      </div>
                      <p className="text-sm text-text-secondary">
                        Auto-notifications go out 24 hours and 1 hour before the doors open.
                      </p>
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-text-secondary">
                        <span className="h-px w-6 bg-border"></span>
                        Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in space-y-4">
            <span className="inline-flex items-center justify-center text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
              Why EMS Works
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold">
              Essential controls without the clutter
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Each module is designed to keep teams aligned and attendees engaged, all within a focused, monochrome workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-border/70 bg-background/70 p-8 space-y-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-text-secondary">
                  <span>{feature.tag}</span>
                  <span>EMS</span>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${feature.accent}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-text">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gradient-to-br from-surface/60 via-surface/40 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4 animate-fade-in">
                <span className="inline-flex text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
                  How EMS Flows
                </span>
                <h2 className="text-4xl font-semibold text-text">A fluid journey from idea to impact</h2>
                <p className="text-lg text-text-secondary">
                  Whether you are lighting up a hackathon or curating a seminar series, EMS guides every collaborator through a clear, shared rhythm. No more duct-taped spreadsheets or lost messages.
                </p>
              </div>

              <div className="space-y-6">
                {experienceSteps.map((step) => (
                  <div
                    key={step.title}
                    className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/75 p-6 transition-transform duration-300 hover:-translate-y-1 animate-slide-up"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-border/80"></div>
                    <div className="flex gap-5">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${step.accent}`}>
                        <step.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <span className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">{step.tag}</span>
                        <h3 className="text-2xl font-semibold text-text">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent)] blur-3xl"></div>
              <div className="relative w-full max-w-sm rounded-3xl border border-border/70 bg-background/82 p-8 space-y-5 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.3em] text-text-secondary text-center">Designed for calm execution</div>
                <h3 className="text-3xl font-semibold text-text text-center">Familiar tools, distilled</h3>
                <p className="text-sm leading-relaxed text-text-secondary text-center">
                  Swap fragmented documents and threads for one composed command center. EMS keeps logistics, creative assets, and approvals harmonised without demanding a new learning curve.
                </p>
                <div className="space-y-3 text-sm text-text-secondary pl-1">
                  <div className="flex items-start gap-3">
                    <AiOutlineCheckCircle className="w-5 h-5 text-text" />
                    <span>Reusable templates lock in brand consistency while staying adaptable.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AiOutlineBarChart className="w-5 h-5 text-text" />
                    <span>Live engagement signals surface bottlenecks before they become issues.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AiOutlineSafety className="w-5 h-5 text-text" />
                    <span>Secure access controls protect sensitive details across committees.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Highlights */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <span className="inline-flex text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
              Tailored Touchpoints
            </span>
            <h2 className="text-4xl font-semibold text-text">Built for the people who make campus pulse</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              EMS adapts to every perspective—students discover, organisers orchestrate, and faculty stay informed without extra effort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audienceHighlights.map((card) => (
              <div key={card.title} className={`rounded-3xl border ${card.accent} p-8 space-y-5 animate-fade-in`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-text">{card.title}</h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">Perspective</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <AiOutlineCheckCircle className="w-5 h-5 flex-shrink-0 text-text" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-[2.5rem] border border-border bg-background/80 px-10 py-16 space-y-8 animate-scale-in">
            <span className="inline-flex text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary">
              Start in Minutes
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold text-text">
              Ready to shape your next event?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Launch a modern campus hub where planning, coordination, and communication happen in one serene command center.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center rounded-full border border-border bg-text px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-background transition-colors duration-200 hover:bg-background hover:text-text"
              >
                Launch a New Event
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-text-secondary transition-colors duration-200 hover:bg-background hover:text-text"
              >
                Rejoin Your Hub
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white rounded-lg p-1">
                <img
                  src="/psg.png"
                  alt="PSG Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-8 h-8 bg-surface rounded-lg p-1 border border-border">
                <img
                  src="/csea.png"
                  alt="CSEA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-lg font-bold gradient-text">EMS</span>
            </div>
            <div className="text-text-secondary text-sm">
              2024 Event Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
