import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Hand, 
  FileText, 
  Monitor, 
  Zap, 
  Layout, 
  ArrowRight,
  ChevronRight,
  Globe,
  Database,
  Cpu
} from "lucide-react";
import { SiReact, SiTailwindcss } from "react-icons/si";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 1) Top Nav Bar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Hand className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Gesture Presentation System
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#research" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Research</a>
              <a href="#tech" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Technology</a>
              <Link href="/present/1">
                <Button size="sm" className="font-semibold shadow-sm">
                  Launch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* 2) Hero Section */}
        <section id="about" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/5 text-primary border-primary/10">
                  Final Year Project 2025–26
                </Badge>
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight">
                    Gesture-Based PDF <br />
                    <span className="text-primary">Presentation Control</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                    An exploratory HCI research prototype investigating touchless interaction paradigms for presentation navigation using computer vision and hand gesture recognition.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/present/1">
                    <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md">
                      Try the Prototype <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="#research">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
                    Read More
                  </Button>
                  </a>
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">VY</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">Vanshika Yadav</p>
                    <p className="text-sm text-muted-foreground">BSc Computer Science, Final Year</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl" />
                <Card className="relative p-8 border-border shadow-xl rounded-2xl bg-white/50 backdrop-blur-sm">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Touchless Navigation</h3>
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">Real-time</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: "🖐️", label: "Open Palm" },
                        { icon: "✊", label: "Closed Fist" },
                        { icon: "✌️", label: "Peace Sign" }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center p-4 bg-white border rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                          <span className="text-4xl mb-2">{item.icon}</span>
                          <span className="text-xs font-medium text-muted-foreground text-center">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center font-medium italic">
                      "Hand gestures detected in real-time using standard webcam hardware"
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 3) Research Context Section */}
        <section id="research" className="py-24 bg-secondary/30 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold mb-6">Research Context</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-16 text-lg">
              This project investigates the efficacy and user experience of non-contact interaction 
              systems in professional presentation environments, focusing on precision and 
              latency reduction in gesture translation.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Monitor className="w-6 h-6" />, 
                  title: "Computer Vision", 
                  desc: "MediaPipe Hands framework utilizing 21-point 3D landmark detection for skeletal tracking." 
                },
                { 
                  icon: <Cpu className="w-6 h-6" />, 
                  title: "Gesture Recognition", 
                  desc: "Custom algorithmic heuristics and state-machine logic for robust gesture classification." 
                },
                { 
                  icon: <Globe className="w-6 h-6" />, 
                  title: "Browser-Native", 
                  desc: "Client-side execution ensuring privacy and immediate response without external hardware." 
                }
              ].map((card, i) => (
                <Card key={i} className="p-8 text-left border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 4) Technical Implementation Section */}
        <section id="tech" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-8">Technical Implementation</h2>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Gesture Set</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-4 group">
                          <span className="text-2xl w-8">🖐️</span>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">Open Palm</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold">Next Page</span>
                        </li>
                        <li className="flex items-center gap-4">
                          <span className="text-2xl w-8">✊</span>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">Closed Fist</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold">Previous Page</span>
                        </li>
                        <li className="flex items-center gap-4">
                          <span className="text-2xl w-8">✌️</span>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">Peace Sign</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold">Toggle Listening</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Design Principles</h4>
                      <ul className="grid grid-cols-2 gap-y-4 text-sm font-medium">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Minimal vocabulary</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Accidental trigger prevention</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Real-time feedback</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Evaluation logging</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Technology Stack</h4>
                   <div className="flex flex-wrap gap-3">
                     {[
                       { icon: <SiReact />, label: "React" },
                       { icon: <Monitor />, label: "MediaPipe" },
                       { icon: <Monitor />, label: "WebRTC" },
                       { icon: <FileText />, label: "PDF.js" },
                       { icon: <SiTailwindcss />, label: "TailwindCSS" }
                     ].map((chip, i) => (
                       <Badge key={i} variant="outline" className="px-4 py-1.5 flex items-center gap-2 text-sm bg-white font-semibold border-border">
                         {chip.label}
                       </Badge>
                     ))}
                   </div>
                </div>
              </div>

              <div>
                <Card className="p-10 bg-slate-900 text-white border-0 shadow-2xl rounded-3xl h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-display font-bold mb-8">Project Objectives</h3>
                  <ul className="space-y-8">
                    {[
                      { 
                        title: "HCI Investigation", 
                        text: "To explore user acceptance and intuitiveness of non-contact interfaces during cognitive load." 
                      },
                      { 
                        title: "Geometric Normalization", 
                        text: "Developing robust algorithms to handle hand-size variation and depth perception." 
                      },
                      { 
                        title: "Latency Minimization", 
                        text: "Optimizing the vision pipeline for sub-50ms frame processing in-browser." 
                      },
                      { 
                        title: "Feedback Systems", 
                        text: "Designing effective visual cues that inform the user without distracting from content." 
                      }
                    ].map((obj, i) => (
                      <li key={i} className="flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                          0{i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-white/90">{obj.title}</p>
                          <p className="text-sm text-white/50 leading-relaxed">{obj.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 5) Footer CTA Band */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl font-display font-bold">Ready to Experience Gesture Control?</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Launch the research prototype to test the real-time detection pipeline 
              and explore touchless presentation navigation.
            </p>
            <div className="pt-4">
              <Link href="/present/1">
                <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-white/90 shadow-xl transition-transform hover:-translate-y-1">
                  Launch Prototype
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            © 2025–26 Vanshika Yadav · Final Year Project · BSc Computer Science
          </p>
          <div className="flex items-center gap-6">
            <a href="#tech" className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">Documentation</a>
            <a href="#research" className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">References</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
