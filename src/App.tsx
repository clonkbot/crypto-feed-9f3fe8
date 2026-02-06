import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}

const generateSparkline = (): number[] => {
  const points: number[] = [];
  let value = 50 + Math.random() * 50;
  for (let i = 0; i < 24; i++) {
    value += (Math.random() - 0.5) * 15;
    value = Math.max(10, Math.min(90, value));
    points.push(value);
  }
  return points;
};

const MOCK_CRYPTOS: CryptoData[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 67245.89, change24h: 2.34, marketCap: 1324000000000, volume24h: 28500000000, sparkline: generateSparkline() },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3521.42, change24h: -1.28, marketCap: 423000000000, volume24h: 15200000000, sparkline: generateSparkline() },
  { id: 'sol', symbol: 'SOL', name: 'Solana', price: 178.93, change24h: 5.67, marketCap: 82000000000, volume24h: 3400000000, sparkline: generateSparkline() },
  { id: 'bnb', symbol: 'BNB', name: 'BNB Chain', price: 612.45, change24h: 0.89, marketCap: 91000000000, volume24h: 1800000000, sparkline: generateSparkline() },
  { id: 'xrp', symbol: 'XRP', name: 'Ripple', price: 0.5234, change24h: -0.45, marketCap: 28000000000, volume24h: 1200000000, sparkline: generateSparkline() },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.4521, change24h: 3.21, marketCap: 16000000000, volume24h: 520000000, sparkline: generateSparkline() },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change24h: -2.15, marketCap: 18000000000, volume24h: 890000000, sparkline: generateSparkline() },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche', price: 38.76, change24h: 4.32, marketCap: 14500000000, volume24h: 620000000, sparkline: generateSparkline() },
];

const formatPrice = (price: number): string => {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
};

const formatMarketCap = (cap: number): string => {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  return `$${(cap / 1e6).toFixed(1)}M`;
};

const SparklineChart = ({ data, positive }: { data: number[]; positive: boolean }) => {
  const width = 100;
  const height = 32;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - (val / 100) * height}`).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? '#00ff41' : '#ff0040'} stopOpacity="0.4" />
          <stop offset="100%" stopColor={positive ? '#00ff41' : '#ff0040'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={positive ? '#00ff41' : '#ff0040'}
        strokeWidth="1.5"
        points={points}
        className="drop-shadow-[0_0_6px_currentColor]"
      />
    </svg>
  );
};

const CryptoRow = ({ crypto, index }: { crypto: CryptoData; index: number }) => {
  const [flash, setFlash] = useState(false);
  const isPositive = crypto.change24h >= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setFlash(true);
        setTimeout(() => setFlash(false), 200);
      }
    }, 2000 + index * 500);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`grid grid-cols-12 gap-2 md:gap-4 items-center py-3 md:py-4 px-3 md:px-6 border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5 transition-all duration-300 group ${flash ? 'bg-[#00ff41]/10' : ''}`}
    >
      {/* Rank */}
      <div className="col-span-1 text-[#00ff41]/40 font-mono text-xs md:text-sm">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Name & Symbol */}
      <div className="col-span-4 md:col-span-3 flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center text-xs md:text-sm font-bold text-[#00ff41] group-hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-shadow">
          {crypto.symbol.slice(0, 2)}
        </div>
        <div>
          <div className="font-bold text-[#e0e0e0] text-sm md:text-base group-hover:text-[#00ff41] transition-colors">{crypto.symbol}</div>
          <div className="text-[10px] md:text-xs text-[#00ff41]/40 hidden sm:block">{crypto.name}</div>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-3 md:col-span-2 text-right">
        <motion.div
          key={crypto.price}
          initial={{ scale: flash ? 1.1 : 1 }}
          animate={{ scale: 1 }}
          className={`font-mono text-sm md:text-lg ${flash ? 'text-[#00f5ff]' : 'text-[#e0e0e0]'} transition-colors`}
        >
          ${formatPrice(crypto.price)}
        </motion.div>
      </div>

      {/* 24h Change */}
      <div className="col-span-4 md:col-span-2 text-right">
        <div className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded font-mono text-xs md:text-sm ${
          isPositive
            ? 'bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]'
            : 'bg-[#ff0040]/10 text-[#ff0040] shadow-[0_0_10px_rgba(255,0,64,0.2)]'
        }`}>
          <span className="text-[10px] md:text-xs">{isPositive ? '▲' : '▼'}</span>
          {Math.abs(crypto.change24h).toFixed(2)}%
        </div>
      </div>

      {/* Market Cap - Hidden on mobile */}
      <div className="hidden md:block md:col-span-2 text-right font-mono text-sm text-[#00ff41]/60">
        {formatMarketCap(crypto.marketCap)}
      </div>

      {/* Sparkline - Hidden on mobile */}
      <div className="hidden md:flex md:col-span-2 justify-end">
        <SparklineChart data={crypto.sparkline} positive={isPositive} />
      </div>
    </motion.div>
  );
};

const ScanlineOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
      }}
    />
  </div>
);

const GlitchText = ({ children, className = '' }: { children: string; className?: string }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative ${className}`}>
      <span className={glitch ? 'opacity-0' : ''}>{children}</span>
      {glitch && (
        <>
          <span className="absolute inset-0 text-[#ff0040] translate-x-[2px]">{children}</span>
          <span className="absolute inset-0 text-[#00f5ff] -translate-x-[2px]">{children}</span>
        </>
      )}
    </span>
  );
};

const StatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [blockHeight, setBlockHeight] = useState(842156);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-between items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-[#0a0a0a]/80 border-b border-[#00ff41]/20 font-mono text-[10px] md:text-xs">
      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <span className="text-[#00ff41]/60">STATUS:</span>
        <span className="flex items-center gap-1 md:gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_10px_#00ff41]" />
          <span className="text-[#00ff41]">CONNECTED</span>
        </span>
        <span className="hidden sm:inline text-[#00ff41]/40">|</span>
        <span className="hidden sm:inline text-[#00f5ff]/60">BLOCK: {blockHeight.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden sm:inline text-[#ffb000]/60">GAS: 23 GWEI</span>
        <span className="text-[#00ff41]/40">|</span>
        <span className="text-[#00ff41]">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  );
};

function App() {
  const [cryptos, setCryptos] = useState<CryptoData[]>(MOCK_CRYPTOS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState<'marketCap' | 'change24h' | 'price'>('marketCap');

  const updatePrices = useCallback(() => {
    setCryptos(prev => prev.map(crypto => ({
      ...crypto,
      price: crypto.price * (1 + (Math.random() - 0.5) * 0.002),
      change24h: crypto.change24h + (Math.random() - 0.5) * 0.1,
      sparkline: [...crypto.sparkline.slice(1), crypto.sparkline[crypto.sparkline.length - 1] + (Math.random() - 0.5) * 5],
    })));
  }, []);

  useEffect(() => {
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  const filteredCryptos = cryptos
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (selectedSort === 'change24h') return Math.abs(b.change24h) - Math.abs(a.change24h);
      if (selectedSort === 'price') return b.price - a.price;
      return b.marketCap - a.marketCap;
    });

  const totalMarketCap = cryptos.reduce((acc, c) => acc + c.marketCap, 0);
  const avgChange = cryptos.reduce((acc, c) => acc + c.change24h, 0) / cryptos.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono overflow-x-hidden flex flex-col">
      <ScanlineOverlay />

      {/* Header */}
      <header className="relative border-b border-[#00ff41]/30 bg-gradient-to-b from-[#00ff41]/5 to-transparent">
        <StatusBar />

        <div className="px-4 md:px-8 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 md:gap-3 mb-2"
              >
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#00ff41] shadow-[0_0_20px_#00ff41,0_0_40px_#00ff41]" />
                <span className="text-[10px] md:text-xs text-[#00ff41]/60 tracking-[0.3em]">DECENTRALIZED PRICE FEED v2.4.1</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                <GlitchText className="text-[#00ff41] drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]">CRYPTO</GlitchText>
                <span className="text-[#00f5ff] drop-shadow-[0_0_30px_rgba(0,245,255,0.5)]">_FEED</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-sm text-[#00ff41]/40 mt-2"
              >
                [[ REAL-TIME MARKET DATA STREAM ]]
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 md:gap-8"
            >
              <div className="text-right">
                <div className="text-[10px] md:text-xs text-[#00ff41]/40 mb-1">TOTAL MCAP</div>
                <div className="text-lg md:text-2xl text-[#00f5ff] font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                  {formatMarketCap(totalMarketCap)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] md:text-xs text-[#00ff41]/40 mb-1">AVG 24H</div>
                <div className={`text-lg md:text-2xl font-bold ${avgChange >= 0 ? 'text-[#00ff41]' : 'text-[#ff0040]'}`} style={{ fontFamily: 'Orbitron, monospace' }}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-[#00ff41]/20 bg-[#0a0a0a]/90">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#00ff41]/40">&gt;_</span>
            <input
              type="text"
              placeholder="SEARCH ASSET..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#00ff41]/30 rounded px-8 md:px-10 py-3 md:py-3 text-[#00ff41] placeholder-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all text-sm"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {(['marketCap', 'price', 'change24h'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSelectedSort(sort)}
                className={`px-3 md:px-4 py-3 text-[10px] md:text-xs border transition-all min-h-[44px] ${
                  selectedSort === sort
                    ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                    : 'border-[#00ff41]/30 text-[#00ff41]/50 hover:border-[#00ff41]/60'
                }`}
              >
                {sort === 'marketCap' ? 'MCAP' : sort === 'change24h' ? '24H%' : 'PRICE'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-3 bg-[#00ff41]/5 text-[10px] md:text-xs text-[#00ff41]/60 border-b border-[#00ff41]/20">
        <div className="col-span-1">#</div>
        <div className="col-span-4 md:col-span-3">ASSET</div>
        <div className="col-span-3 md:col-span-2 text-right">PRICE</div>
        <div className="col-span-4 md:col-span-2 text-right">24H</div>
        <div className="hidden md:block md:col-span-2 text-right">MCAP</div>
        <div className="hidden md:block md:col-span-2 text-right">TREND</div>
      </div>

      {/* Crypto List */}
      <main className="flex-1">
        <AnimatePresence>
          {filteredCryptos.map((crypto, index) => (
            <CryptoRow key={crypto.id} crypto={crypto} index={index} />
          ))}
        </AnimatePresence>

        {filteredCryptos.length === 0 && (
          <div className="text-center py-12 md:py-20 text-[#00ff41]/40">
            <div className="text-4xl md:text-6xl mb-4">:/</div>
            <div className="text-sm md:text-base">NO ASSETS FOUND</div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00ff41]/20 px-4 md:px-8 py-4 md:py-6 bg-[#0a0a0a]/90">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] md:text-xs text-[#00ff41]/30">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
            <span className="animate-pulse">[ LIVE ]</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">REFRESHING EVERY 2S</span>
            <span>•</span>
            <span>{cryptos.length} ASSETS TRACKED</span>
          </div>
          <div className="text-[#00ff41]/20 text-center">
            Requested by @jackonchains · Built by @clonkbot
          </div>
        </div>
      </footer>

      {/* Decorative Elements */}
      <div className="fixed top-20 right-4 md:right-8 w-24 md:w-32 h-24 md:h-32 border border-[#00ff41]/10 rotate-45 pointer-events-none opacity-30" />
      <div className="fixed bottom-40 left-4 md:left-8 w-16 md:w-24 h-16 md:h-24 border border-[#00f5ff]/10 pointer-events-none opacity-20" />
    </div>
  );
}

export default App;
