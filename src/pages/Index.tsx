import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ArrowRight, TrendingUp, PiggyBank, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

function AnimatedCurrency({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let startValue = displayValue
    let start: number | null = null
    const duration = 500

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 4) // easeOutQuart

      setDisplayValue(startValue + (value - startValue) * easeProgress)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }
    window.requestAnimationFrame(step)
  }, [value])

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayValue)}
    </span>
  )
}

const chartConfig = {
  total: {
    label: 'Total Acumulado',
    color: 'hsl(var(--primary))',
  },
  invested: {
    label: 'Total Investido',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig

export default function Index() {
  const [initialValue, setInitialValue] = useState<number | ''>(10000)
  const [monthlyValue, setMonthlyValue] = useState<number | ''>(500)
  const [interestRate, setInterestRate] = useState<number | ''>(10)
  const [rateType, setRateType] = useState<'mensal' | 'anual'>('anual')
  const [years, setYears] = useState<number | ''>(10)
  const [months, setMonths] = useState<number | ''>(0)

  const { data, summary } = useMemo(() => {
    const p = Number(initialValue) || 0
    const pmt = Number(monthlyValue) || 0
    const rate = Number(interestRate) || 0
    const y = Number(years) || 0
    const m = Number(months) || 0

    const totalMonths = y * 12 + m
    const r = rateType === 'anual' ? Math.pow(1 + rate / 100, 1 / 12) - 1 : rate / 100

    const chartData = []
    let currentTotal = p
    let currentInvested = p

    chartData.push({
      month: 0,
      label: 'Início',
      invested: currentInvested,
      total: currentTotal,
      interest: 0,
    })

    for (let i = 1; i <= totalMonths; i++) {
      currentTotal = currentTotal * (1 + r) + pmt
      currentInvested += pmt

      // Reduce data points for very long periods to keep chart performant and readable
      if (totalMonths <= 36 || i === totalMonths || i % 12 === 0) {
        chartData.push({
          month: i,
          label: i % 12 === 0 ? `${i / 12} ano${i / 12 > 1 ? 's' : ''}` : `${i} meses`,
          invested: currentInvested,
          total: currentTotal,
          interest: currentTotal - currentInvested,
        })
      }
    }

    const summaryData =
      chartData.length > 0
        ? chartData[chartData.length - 1]
        : { invested: p, total: p, interest: 0 }

    return { data: chartData, summary: summaryData }
  }, [initialValue, monthlyValue, interestRate, rateType, years, months])

  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`
    return `R$ ${val}`
  }

  const formatCurrencyLabel = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const scrollToResults = () => {
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 animate-fade-in-up">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card className="border-t-4 border-t-emerald-500 shadow-elevation transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-emerald-900">Parâmetros</CardTitle>
              <CardDescription>Ajuste os valores para simular seus ganhos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="initialValue" className="text-slate-700">
                  Valor Inicial
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                    R$
                  </span>
                  <Input
                    id="initialValue"
                    type="number"
                    min="0"
                    step="100"
                    className="pl-9 bg-slate-50 focus-visible:ring-emerald-500"
                    value={initialValue}
                    onChange={(e) =>
                      setInitialValue(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyValue" className="text-slate-700">
                  Valor Mensal
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                    R$
                  </span>
                  <Input
                    id="monthlyValue"
                    type="number"
                    min="0"
                    step="100"
                    className="pl-9 bg-slate-50 focus-visible:ring-emerald-500"
                    value={monthlyValue}
                    onChange={(e) =>
                      setMonthlyValue(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-slate-700">
                  Taxa de Juros (%)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="interestRate"
                      type="number"
                      min="0"
                      step="0.1"
                      className="pr-8 bg-slate-50 focus-visible:ring-emerald-500"
                      value={interestRate}
                      onChange={(e) =>
                        setInterestRate(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                      %
                    </span>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={rateType}
                    onValueChange={(val) => val && setRateType(val as 'mensal' | 'anual')}
                    className="bg-slate-100 rounded-md p-1"
                  >
                    <ToggleGroupItem
                      value="mensal"
                      className="text-xs px-2 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm"
                    >
                      Mensal
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="anual"
                      className="text-xs px-2 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm"
                    >
                      Anual
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Período</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      id="years"
                      type="number"
                      min="0"
                      className="pr-12 bg-slate-50 focus-visible:ring-emerald-500"
                      value={years}
                      onChange={(e) =>
                        setYears(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      Anos
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="months"
                      type="number"
                      min="0"
                      max="11"
                      className="pr-14 bg-slate-50 focus-visible:ring-emerald-500"
                      value={months}
                      onChange={(e) =>
                        setMonths(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      Meses
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={scrollToResults}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white lg:hidden mt-4 transition-all duration-300 active:scale-[0.98]"
              >
                Ver Resultados <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results & Chart */}
        <div id="resultados" className="lg:col-span-8 xl:col-span-9 space-y-6 scroll-mt-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="bg-emerald-500 text-white shadow-md border-none relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="absolute right-[-10%] top-[-10%] opacity-10">
                <Target className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-sm font-medium text-emerald-100 mb-1">Valor Total Final</p>
                <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                  <AnimatedCurrency value={summary.total} />
                </h3>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border-none bg-white transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-1">
                  <PiggyBank className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-500">Total Investido</p>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  <AnimatedCurrency value={summary.invested} />
                </h3>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border-none bg-white border-l-4 border-l-emerald-500 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-medium text-slate-500">Total em Juros</p>
                </div>
                <h3 className="text-2xl font-bold text-emerald-600">
                  <AnimatedCurrency value={summary.interest} />
                </h3>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elevation border-none transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-emerald-900">Evolução do Patrimônio</CardTitle>
              <CardDescription>
                Visualização do efeito dos juros compostos ao longo do tempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] sm:h-[400px] w-full mt-4">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart data={data} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      minTickGap={40}
                      className="text-xs font-medium"
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      width={80}
                      className="text-xs font-medium"
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: 'var(--color-primary)',
                        strokeWidth: 1,
                        strokeDasharray: '3 3',
                        opacity: 0.5,
                      }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, item) => {
                            // Map generic names back to config labels explicitly if needed, but config does it
                            return [formatCurrencyLabel(Number(value)), name]
                          }}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent className="text-sm" />} />

                    <Line
                      type="monotone"
                      dataKey="invested"
                      name="invested"
                      stroke="var(--color-invested)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--color-invested)' }}
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="total"
                      stroke="var(--color-total)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: 'var(--background)',
                        stroke: 'var(--color-total)',
                      }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
