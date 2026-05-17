import { useState, useEffect, useRef } from 'react';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';
import { Trash2, Info, RefreshCw, Sun, Moon, Activity, BarChart3, Target, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface Transaction {
  id: string;
  quantity: number;
  buyPrice: number;
  totalCost: number;
}

interface RecoveryPlan {
  name: string;
  targetAvg: number;
  sharesToBuy: number;
  capitalRequired: number;
}

const showcaseCards = [
  {
    title: 'Live Price Check',
    label: 'Market',
    description: 'Compare the current price with your average buy price before making a new entry.',
    metric: '01',
    icon: Activity,
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    glowClass: 'bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.24),transparent_42%)]',
    lineClass: 'from-emerald-400/90 to-teal-300/70',
    points: ['Current price below average means unrealized loss', 'Current price above average means profit zone', 'Avoid decisions from price alone'],
    formula: 'P&L = (Live Price - Avg Price) × Shares',
  },
  {
    title: 'Average Buy Price',
    label: 'Cost Basis',
    description: 'Your average price shows the level where your position starts moving from loss to profit.',
    metric: '02',
    icon: BarChart3,
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    glowClass: 'bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.22),transparent_44%)]',
    lineClass: 'from-sky-300/90 to-cyan-200/70',
    points: ['Cost basis is your true break-even level', 'Fees/taxes can move real break-even higher', 'Adding shares changes this number immediately'],
    formula: 'Avg = Total Invested ÷ Total Shares',
  },
  {
    title: 'Averaging Down',
    label: 'Strategy',
    description: 'Averaging down can reduce break-even, but it also increases exposure and capital at risk.',
    metric: '03',
    icon: Target,
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    glowClass: 'bg-[radial-gradient(circle_at_25%_20%,rgba(245,158,11,0.22),transparent_42%)]',
    lineClass: 'from-amber-300/90 to-orange-200/70',
    points: ['Works only if the business/setup is still valid', 'Reduces break-even but raises total exposure', 'Never average down without a max capital limit'],
    formula: 'New Avg = (Old Cost + New Cost) ÷ Final Shares',
  },
  {
    title: 'Risk Reminder',
    label: 'Discipline',
    description: 'Do not add more capital only to recover faster. Check position size, news, and stop-loss first.',
    metric: '04',
    icon: ShieldCheck,
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    glowClass: 'bg-[radial-gradient(circle_at_25%_20%,rgba(139,92,246,0.2),transparent_42%)]',
    lineClass: 'from-violet-300/90 to-fuchsia-200/70',
    points: ['Set a maximum loss before entering', 'Do not turn every trade into long-term holding', 'Position size matters more than conviction'],
    formula: 'Risk = Capital × Loss %',
  },
  {
    title: 'Break-even Path',
    label: 'Projection',
    description: 'Use projections to see how many shares are needed and how much price recovery is required.',
    metric: '05',
    icon: Sparkles,
    badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    glowClass: 'bg-[radial-gradient(circle_at_25%_20%,rgba(244,63,94,0.2),transparent_42%)]',
    lineClass: 'from-rose-300/90 to-pink-200/70',
    points: ['Projection is a planning tool, not a guarantee', 'Required rise shows how hard recovery is', 'If recovery needs too much capital, wait or exit'],
    formula: 'Required Rise = (New Avg - Live Price) ÷ Live Price',
  },
];

function ShowcaseCarousel() {
  const repeatedCards = [...showcaseCards, ...showcaseCards];
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = carouselRef.current;
    if (!stage) return;

    let frameId = 0;

    const updateParallax = () => {
      const stageRect = stage.getBoundingClientRect();
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      if (isMobile) {
        stage.querySelectorAll<HTMLElement>('.carousel-card').forEach((card) => {
          card.style.setProperty('--parallax-shift', '0px');
          card.style.setProperty('--parallax-rise', '0px');
          card.style.setProperty('--parallax-scale', '1');
          card.style.setProperty('--overlay-shift', '0px');
        });
        return;
      }

      const stageCenter = isMobile
        ? stageRect.top + stageRect.height / 2
        : stageRect.left + stageRect.width / 2;
      const cards = stage.querySelectorAll<HTMLElement>('.carousel-card');

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = isMobile
          ? cardRect.top + cardRect.height / 2
          : cardRect.left + cardRect.width / 2;
        const progress = (cardCenter - stageCenter) / Math.max((isMobile ? stageRect.height : stageRect.width) / 2, 1);
        const clamped = Math.max(-1, Math.min(1, progress));
        const focus = 1 - Math.abs(clamped);

        card.style.setProperty('--parallax-shift', `${clamped * (isMobile ? -22 : -34)}px`);
        card.style.setProperty('--parallax-rise', `${focus * -10}px`);
        card.style.setProperty('--parallax-scale', `${1 + focus * 0.045}`);
        card.style.setProperty('--overlay-shift', `${clamped * 14}px`);
      });
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    stage.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      stage.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <motion.section
      className="mt-16"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-12 flex flex-col gap-6 md:gap-4 md:flex-row md:items-end md:justify-between sm:mb-16">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Investor Notes
          </span>
          <h3 className="text-2xl font-light tracking-tight sm:text-3xl md:text-4xl lg:text-6xl">
            What these numbers mean
          </h3>
        </div>
        <p className="max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
          Use this section to understand your average price, current risk, and when averaging down may help or hurt your position.
        </p>
      </div>

      <div
        ref={carouselRef}
        className="carousel-stage -mx-4 overflow-x-auto px-4 py-3 sm:-mx-8 sm:px-8"
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY;
          }
        }}
      >
        <motion.div className="carousel-shell w-max">
          <div className="carousel-track flex w-max gap-6 pr-6">
            {repeatedCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={`${card.title}-${index}`}
                  className={`carousel-card group relative h-[430px] w-[82vw] max-w-[320px] shrink-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-2xl shadow-black/20 sm:w-[320px] md:w-[380px] ${index >= showcaseCards.length ? 'carousel-duplicate' : ''}`}
                  initial="rest"
                  whileHover="hover"
                  variants={{
                    rest: { y: 0, scale: 1 },
                    hover: { y: -8, scale: 1.015 },
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`carousel-parallax-bg absolute inset-0 ${card.glowClass}`}
                  />
                  <div
                    className="carousel-parallax-orb absolute -right-14 top-14 h-40 w-40 rounded-full border border-white/10 bg-white/[0.03] blur-sm"
                  />

                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${card.badgeClass}`}>
                        {card.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{card.metric}</span>
                    </div>

                    <div
                      className="carousel-parallax-content space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-light tracking-tight">{card.title}</h4>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio guide</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-background/25 p-4 backdrop-blur-sm">
                        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Key checks</p>
                        <ul className="space-y-2">
                          {card.points.map((point) => (
                            <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="carousel-parallax-overlay rounded-lg border border-white/10 bg-background/55 p-4 shadow-xl backdrop-blur-xl">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {card.description}
                      </p>
                      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-foreground">
                        {card.formula}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [livePrice, setLivePrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<string>('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('balanced');
  const [manualTarget, setManualTarget] = useState<string>('');
  const [targetLivePrice, setTargetLivePrice] = useState<string>('');
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('portfolio-transactions');
    const savedLivePrice = localStorage.getItem('portfolio-livePrice');
    const savedManualTarget = localStorage.getItem('portfolio-manualTarget');
    const savedSelectedPlan = localStorage.getItem('portfolio-selectedPlan');

    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error('Failed to parse saved transactions');
      }
    }
    if (savedLivePrice) {
      setLivePrice(parseFloat(savedLivePrice) || 0);
    }
    if (savedManualTarget) {
      setManualTarget(savedManualTarget);
    }
    if (savedSelectedPlan) {
      setSelectedPlan(savedSelectedPlan);
    }
  }, []);

  // Save to localStorage - batched updates
  useEffect(() => {
    localStorage.setItem('portfolio-transactions', JSON.stringify(transactions));
    localStorage.setItem('portfolio-livePrice', livePrice.toString());
    localStorage.setItem('portfolio-manualTarget', manualTarget);
    localStorage.setItem('portfolio-selectedPlan', selectedPlan);
  }, [transactions, livePrice, manualTarget, selectedPlan]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const statsScale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculations
  const totalShares = transactions.reduce((sum, t) => sum + t.quantity, 0);
  const totalInvested = transactions.reduce((sum, t) => sum + t.totalCost, 0);
  const avgBuyPrice = totalShares > 0 ? totalInvested / totalShares : 0;
  const marketValue = totalShares * livePrice;
  const totalPnL = marketValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const pnlPerShare = totalShares > 0 ? totalPnL / totalShares : 0;
  const isProfit = totalPnL >= 0;
  const currentLoss = totalPnL < 0 ? Math.abs(totalPnL) : 0;

  // Recovery Plans
  const calculateRecoveryShares = (targetAvg: number, isManual: boolean = false) => {
    if (!targetAvg || targetAvg <= 0 || livePrice <= 0 || totalShares <= 0 || avgBuyPrice <= 0) {
      return 0;
    }
    if (targetAvg === livePrice) {
      return 0;
    }
    if (!isManual) {
      if (currentLoss <= 0 || targetAvg <= livePrice || targetAvg >= avgBuyPrice) {
        return 0;
      }
    } else {
      if (targetAvg <= livePrice) {
        return 0;
      }
    }
    const shares = (totalInvested - (targetAvg * totalShares)) / (targetAvg - livePrice);
    return shares > 0 ? Math.ceil(shares) : 0;
  };

  const createRecoveryPlan = (name: string, targetAvg: number, isManual: boolean): RecoveryPlan => {
    const sharesToBuy = calculateRecoveryShares(targetAvg, isManual);
    return {
      name,
      targetAvg,
      sharesToBuy,
      capitalRequired: sharesToBuy * livePrice,
    };
  };

  const shouldShowRecoveryValues = currentLoss > 0 && livePrice > 0 && avgBuyPrice > livePrice;
  const aggressiveTarget = shouldShowRecoveryValues
    ? livePrice + ((avgBuyPrice - livePrice) * 0.25)
    : 0;
  const balancedTarget = shouldShowRecoveryValues
    ? avgBuyPrice - ((avgBuyPrice - livePrice) * 0.5)
    : 0;
  const conservativeTarget = shouldShowRecoveryValues
    ? avgBuyPrice - ((avgBuyPrice - livePrice) * 0.25)
    : 0;
  const manualTargetNum = parseFloat(manualTarget);
  // Allow manual target input independently - if input is valid and positive, use it
  const resolvedManualTarget = manualTarget && !isNaN(manualTargetNum) && manualTargetNum > 0 ? manualTargetNum : 0;

  // Only calculate recovery plans if in loss
  const recoveryPlans: RecoveryPlan[] = currentLoss > 0 ? [
    createRecoveryPlan('Aggressive', aggressiveTarget, false),
    createRecoveryPlan('Balanced', balancedTarget, false),
    createRecoveryPlan('Conservative', conservativeTarget, false),
    createRecoveryPlan('Manual', resolvedManualTarget, true),
  ] : [];

  // Filter out recovery plans with 0 shares
  const filteredRecoveryPlans = recoveryPlans.filter(plan => plan.sharesToBuy > 0);

  // Get selected recovery plan
  const activePlan = filteredRecoveryPlans.find(p => p.name.toLowerCase() === selectedPlan);
  
  // Projection calculations
  const finalShares = activePlan ? totalShares + activePlan.sharesToBuy : totalShares;
  const newAvgPrice = activePlan && activePlan.sharesToBuy > 0
    ? (totalInvested + activePlan.capitalRequired) / finalShares
    : avgBuyPrice;
  const priceRiseRequired = newAvgPrice > 0 ? ((newAvgPrice - livePrice) / livePrice) * 100 : 0;
  // Net profit at target = (Target Price × Final Shares) - Total Invested
  const netProfitAtTarget = activePlan && activePlan.sharesToBuy > 0 && activePlan.targetAvg > 0
    ? (activePlan.targetAvg * finalShares) - (totalInvested + activePlan.capitalRequired)
    : 0;

  // Target live price calculations - if price reaches X, what's the profit?
  const targetLivePriceNum = parseFloat(targetLivePrice);
  const targetLivePriceProfit = targetLivePrice && !isNaN(targetLivePriceNum) && targetLivePriceNum > 0 && finalShares > 0
    ? (targetLivePriceNum * finalShares) - (totalInvested + (activePlan?.capitalRequired || 0))
    : 0;
  const priceRiseToTarget = livePrice > 0 && targetLivePriceNum > 0 
    ? ((targetLivePriceNum - livePrice) / livePrice) * 100 
    : 0;

  const handleRecordBuy = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);

    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        quantity: qty,
        buyPrice: price,
        totalCost: qty * price
      };
      setTransactions([...transactions, newTransaction]);
      setQuantity('');
      setBuyPrice('');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setTransactions([]);
      setLivePrice(0);
      setQuantity('');
      setBuyPrice('');
      setManualTarget('');
      setSelectedPlan('balanced');
      // Clear localStorage
      localStorage.removeItem('portfolio-transactions');
      localStorage.removeItem('portfolio-livePrice');
      localStorage.removeItem('portfolio-manualTarget');
      localStorage.removeItem('portfolio-selectedPlan');
    }
  };

  return (
    <>
      <div className="glow-border-wrapper" />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden relative z-10">
      <div className="relative z-10">
      {/* Header - Fixed with blur backdrop */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:items-center sm:gap-4 sm:px-8 sm:py-6">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-4">
            <motion.h1
              className="brand-serif min-w-0 text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              KNOW YOUR LOSS
            </motion.h1>
            <motion.div
              className="flex shrink-0 items-center gap-2 pl-0.5 sm:pl-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm uppercase tracking-widest text-muted-foreground">Live</span>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => setHowToUseOpen(true)}>
              <Info className="w-4 h-4 mr-2" />
              Guide
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
              <Sun className="w-4 h-4" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="w-4 h-4" />
            </div>

            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Parallax */}
      <motion.div
        ref={heroRef}
        className="relative pt-40 pb-14 overflow-hidden sm:pt-32 sm:pb-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="container mx-auto px-4 sm:px-8">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`hero-ticket-plaque mx-auto ${isProfit ? 'hero-ticket-profit' : 'hero-ticket-loss'}`}>
              <div className="space-y-4">
                <h2 className="hero-number-font hero-money hero-money-animate text-foreground">
                  {totalPnL === 0 ? '₹0.00' : `₹${totalPnL.toFixed(2)}`}
                </h2>
                <motion.p
                  className={`hero-number-font hero-percent hero-percent-animate ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}
                  animate={{
                    scale: totalPnL !== 0 ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                </motion.p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Badge
                  variant={isProfit ? "default" : "destructive"}
                  className="hero-status-badge px-7 py-3 text-base uppercase"
                >
                  {totalShares === 0 ? 'No Position' : isProfit ? 'In Profit' : 'In Loss'}
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Parallax Background Elements */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-100%']) }}
        />
      </motion.div>

      <main className="container mx-auto max-w-6xl px-4 pb-16 sm:px-8 sm:pb-20">
        <motion.div
          className="grid grid-cols-1 gap-6 lg:gap-8"
          style={{ scale: statsScale }}
        >
          {/* Left Column - Inputs */}
          <motion.div
            className="space-y-6 lg:space-y-8"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Live Market Price */}
            <Card className="p-5 bg-card border border-border hover:border-border/60 transition-all duration-500 group sm:p-8">
              <label className="block text-center text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Live Market Price
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={livePrice || ''}
                onChange={(e) => setLivePrice(parseFloat(e.target.value) || 0)}
                className="mx-auto h-16 max-w-4xl bg-muted/30 text-center text-3xl font-mono border-border group-hover:bg-muted/50 transition-all duration-300 sm:h-20 sm:text-5xl"
              />
              <p className="text-center text-sm text-muted-foreground mt-3 tracking-wide">
                Current market price per share
              </p>
            </Card>

            {/* Add Transaction */}
            <Card className="p-5 bg-card border border-border hover:border-amber-500/30 transition-all duration-500 sm:p-8">
              <h3 className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-6">
                Add Transaction
              </h3>

              <div className="mx-auto max-w-4xl space-y-5">
                <div>
                  <label className="block text-center text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="text-center text-2xl font-mono h-14 bg-muted/30 border-border hover:bg-muted/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-center text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                    Buy Price
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="text-center text-2xl font-mono h-14 bg-muted/30 border-border hover:bg-muted/50 transition-all duration-300"
                  />
                </div>

                <Button
                  onClick={handleRecordBuy}
                  className="record-buy-gradient w-full h-14 text-lg mt-6 hover:scale-[1.02] transition-transform duration-300"
                  disabled={!quantity || !buyPrice}
                >
                  Record Buy
                </Button>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="p-5 bg-card border border-border sm:p-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
                Transaction History
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {transactions.length === 0 ? (
                  <p className="text-base text-muted-foreground text-center py-12">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((t, index) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 group hover:scale-[1.01]"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-lg">
                          {t.quantity} × ₹{t.buyPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Total: ₹{t.totalCost.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Dashboard */}
          <motion.div
            className="space-y-6 lg:space-y-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 sm:text-left lg:gap-6">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full p-5 bg-card border border-border hover:border-border/60 transition-all duration-500 sm:p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Avg Buy Price
                  </p>
                  <p className="break-words text-2xl font-mono tracking-tight sm:text-3xl">
                    ₹{avgBuyPrice.toFixed(2)}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full p-5 bg-card border border-border hover:border-border/60 transition-all duration-500 sm:p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Total Shares
                  </p>
                  <p className="break-words text-2xl font-mono tracking-tight sm:text-3xl">
                    {totalShares}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full p-5 bg-card border border-border hover:border-border/60 transition-all duration-500 sm:p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Total Invested
                  </p>
                  <p className="break-words text-2xl font-mono tracking-tight sm:text-3xl">
                    ₹{totalInvested.toFixed(2)}
                  </p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`h-full p-5 border ${isProfit ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} sm:p-6`}>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Market Value
                  </p>
                  <p className="break-words text-2xl font-mono tracking-tight sm:text-3xl">
                    ₹{marketValue.toFixed(2)}
                  </p>
                  <p className={`text-lg font-mono mt-2 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                    {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* Position Analysis */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <Card className="p-5 bg-card border border-border hover:border-border/60 transition-all duration-500 sm:p-8">
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
                  Position Analysis
                </h3>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground uppercase tracking-wide">P&L per Share</span>
                    <span className={`text-2xl font-mono ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                      ₹{pnlPerShare.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground uppercase tracking-wide">Break-even</span>
                    <span className="text-2xl font-mono">₹{avgBuyPrice.toFixed(2)}</span>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground uppercase tracking-wide">Status</span>
                    <Badge variant={isProfit ? "default" : "destructive"} className="text-base px-4 py-1.5 font-mono uppercase tracking-wider">
                      {isProfit ? 'Profit' : 'Loss'}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all duration-500 sm:p-8">
                <h3 className="text-sm uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-6">
                  Strategic Insight
                </h3>

                <p className="text-lg leading-relaxed">
                  {totalShares === 0
                    ? 'Add transactions to start tracking your portfolio.'
                    : isProfit
                    ? `Your position is in profit. Current gains are ₹${totalPnL.toFixed(2)} (${pnlPercentage.toFixed(2)}%).`
                    : livePrice === 0
                    ? 'Update the live market price to see recovery strategies.'
                    : `Your position is underwater by ₹${Math.abs(totalPnL).toFixed(2)}. Consider recovery strategies below.`
                  }
                </p>
              </Card>
            </div>

            {/* Recovery Plans - Only show when in loss */}
            {currentLoss > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="p-5 bg-card border border-border hover:border-amber-500/30 transition-all duration-500 sm:p-8">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
                    Recovery Plans
                  </h3>
                
                  <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                    <table className="min-w-[720px] w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-sm uppercase tracking-widest text-muted-foreground py-4 px-6">
                            Plan
                          </th>
                          <th className="text-right text-sm uppercase tracking-widest text-muted-foreground py-4 px-6">
                            Target Avg
                          </th>
                          <th className="text-right text-sm uppercase tracking-widest text-muted-foreground py-4 px-6">
                            Shares to Buy
                          </th>
                          <th className="text-right text-sm uppercase tracking-widest text-muted-foreground py-4 px-6">
                            Capital Required
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecoveryPlans.map((plan, index) => (
                          <motion.tr
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            className={`border-b border-border cursor-pointer transition-all duration-300 ${
                              selectedPlan === plan.name.toLowerCase()
                                ? 'bg-amber-500/10 scale-[1.01]'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <td className="py-4 px-6">
                              {plan.name === 'Manual' ? (
                                <div className="flex items-center gap-3">
                                  <span className="text-base font-medium">Manual</span>
                                  <Input
                                    type="number"
                                    placeholder="Target"
                                    value={manualTarget}
                                    onChange={(e) => setManualTarget(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-32 h-10 text-base font-mono"
                                  />
                                </div>
                              ) : (
                                <span className="text-base font-medium">{plan.name}</span>
                              )}
                            </td>
                            <td className="text-right font-mono text-lg py-4 px-6">
                              ₹{plan.targetAvg.toFixed(2)}
                            </td>
                            <td className="text-right font-mono text-lg py-4 px-6">
                              {plan.sharesToBuy}
                            </td>
                            <td className="text-right font-mono text-lg py-4 px-6">
                              ₹{plan.capitalRequired.toFixed(2)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
            </motion.div>
            )}

            {/* Target Live Price Calculator */}
            {activePlan && activePlan.sharesToBuy > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <Card className="p-5 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-500 sm:p-8">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
                    If Price Reaches Target
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                      Target Live Price (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter target price"
                      value={targetLivePrice}
                      onChange={(e) => setTargetLivePrice(e.target.value)}
                      className="text-center text-2xl font-mono h-14 bg-muted/30 border-border hover:bg-muted/50 transition-all duration-300"
                    />
                  </div>

                  {targetLivePrice && !isNaN(targetLivePriceNum) && targetLivePriceNum > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Price Rise Needed</p>
                        <p className={`text-2xl font-mono tracking-tight sm:text-3xl ${
                          priceRiseToTarget >= 0 ? 'text-blue-500' : 'text-red-500'
                        }`}>
                          {priceRiseToTarget.toFixed(2)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Total Profit</p>
                        <p className={`text-2xl font-mono tracking-tight sm:text-3xl ${
                          targetLivePriceProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          ₹{targetLivePriceProfit.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Profit per Share</p>
                        <p className={`text-2xl font-mono tracking-tight sm:text-3xl ${
                          (targetLivePriceProfit / finalShares) >= 0 ? 'text-cyan-500' : 'text-red-500'
                        }`}>
                          ₹{(targetLivePriceProfit / finalShares).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {(!targetLivePrice || isNaN(targetLivePriceNum) || targetLivePriceNum <= 0) && (
                    <p className="text-base text-muted-foreground text-center py-4">
                      Enter a target price to see projected profit
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <ShowcaseCarousel />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground tracking-wide">
              This tool is for educational purposes only. Not financial advice.
            </p>
            <div className="flex gap-8 text-sm">
              <button
                onClick={() => setHowToUseOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                Guide
              </button>
              <button
                onClick={() => setTermsOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
      `}</style>

      {/* How to Use Modal */}
      <Dialog open={howToUseOpen} onOpenChange={setHowToUseOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>How to Use KNOW YOUR LOSS</DialogTitle>
            <DialogDescription>
              A step-by-step guide to track and optimize your stock portfolio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Enter Live Market Price</h4>
                  <p className="text-sm text-muted-foreground">
                    Input the current market price of the stock you're tracking. This updates your real-time P&L.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">Record Your Transactions</h4>
                  <p className="text-sm text-muted-foreground">
                    Add each buy transaction by entering the quantity and price. The app will automatically calculate your average buy price and total investment.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Monitor Your Position</h4>
                  <p className="text-sm text-muted-foreground">
                    View key metrics including total P&L, P&L per share, and market value. The status badge shows if you're in profit or loss.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium mb-1">Choose a Recovery Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    If you're in loss, review recovery plans (Aggressive, Balanced, Conservative, or Manual). Each plan shows how many shares to buy and capital required to reduce your average.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  5
                </div>
                <div>
                  <h4 className="font-medium mb-1">Review Projections</h4>
                  <p className="text-sm text-muted-foreground">
                    See projected outcomes including final shares, new average price, required price rise percentage, and potential profit at your target price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Important information about using KNOW YOUR LOSS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-sm">
            <section>
              <h4 className="font-medium mb-2">1. Educational Purpose Only</h4>
              <p className="text-muted-foreground">
                This tool is designed for educational and informational purposes only. It is not intended to provide financial, investment, tax, or legal advice.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">2. Not Financial Advice</h4>
              <p className="text-muted-foreground">
                The calculations, projections, and recovery strategies provided by this tool do not constitute financial advice. Always consult with a qualified financial advisor before making investment decisions.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">3. No Guarantees</h4>
              <p className="text-muted-foreground">
                Past performance is not indicative of future results. The recovery strategies and projections are based on mathematical calculations and do not guarantee future performance or outcomes.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">4. User Responsibility</h4>
              <p className="text-muted-foreground">
                You are solely responsible for the accuracy of the data you enter and the decisions you make based on the information provided by this tool.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">5. Market Risks</h4>
              <p className="text-muted-foreground">
                Stock market investments carry inherent risks. You may lose some or all of your invested capital. This tool does not account for market volatility, company fundamentals, or external economic factors.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">6. Data Privacy</h4>
              <p className="text-muted-foreground">
                All data entered into this tool is stored locally in your browser. We do not collect, store, or transmit your financial data to any server.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="font-medium mb-2">7. Limitation of Liability</h4>
              <p className="text-muted-foreground">
                The creators of this tool shall not be held liable for any losses, damages, or consequences arising from the use of this tool or decisions made based on its output.
              </p>
            </section>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                By using KNOW YOUR LOSS , you acknowledge that you have read, understood, and agree to these terms and conditions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
    </>
  );
}
