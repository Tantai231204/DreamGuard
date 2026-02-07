import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductTabsProps {
  activeTab: 'single' | 'combo';
  onTabChange: (tab: 'single' | 'combo') => void;
  singleCount: number;
  comboCount: number;
  children: React.ReactNode;
}

export default function ProductTabs({
  activeTab,
  onTabChange,
  singleCount,
  comboCount,
  children,
}: ProductTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v: string) => onTabChange(v as 'single' | 'combo')} className="w-full">
      <div className="px-6 py-6 border-b border-gray-200 bg-white">
        <TabsList className="h-auto p-1.5 bg-white rounded-xl shadow-md border-2 border-gray-200">
          <TabsTrigger
            value="single"
            className="group relative px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:to-cyan-50 data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-[var(--color-primary)] data-[state=inactive]:hover:bg-gray-50"
          >
            <motion.div
              initial={false}
              animate={{
                scale: activeTab === 'single' ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Package className={`h-5 w-5 mr-2.5 transition-colors duration-300 ${
                activeTab === 'single' 
                  ? 'text-[var(--color-primary)]' 
                  : 'text-gray-500 group-hover:text-[var(--color-primary)]'
              }`} />
              <span className={`transition-colors duration-300 ${
                activeTab === 'single' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                Single Products
              </span>
              <Badge 
                className={`ml-3 px-2.5 py-0.5 text-xs font-bold transition-all duration-300 ${
                  activeTab === 'single'
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                }`}
              >
                {singleCount}
              </Badge>
            </motion.div>
          </TabsTrigger>
          
          <TabsTrigger
            value="combo"
            className="group relative px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-50 data-[state=active]:to-pink-50 data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-purple-500 data-[state=inactive]:hover:bg-gray-50"
          >
            <motion.div
              initial={false}
              animate={{
                scale: activeTab === 'combo' ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Layers className={`h-5 w-5 mr-2.5 transition-colors duration-300 ${
                activeTab === 'combo' 
                  ? 'text-purple-600' 
                  : 'text-gray-500 group-hover:text-purple-600'
              }`} />
              <span className={`transition-colors duration-300 ${
                activeTab === 'combo' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                Combo Products
              </span>
              <Badge 
                className={`ml-3 px-2.5 py-0.5 text-xs font-bold transition-all duration-300 ${
                  activeTab === 'combo'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                }`}
              >
                {comboCount}
              </Badge>
            </motion.div>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={activeTab} className="mt-0 flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
