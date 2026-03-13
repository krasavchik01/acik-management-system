import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// Revalidate this route every 1 hour (3600 seconds)
export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch('https://mig.kz/')
    const html = await res.text()
    const $ = cheerio.load(html)
    
    // Default fallback rates just in case scraping fails entirely
    const rates: Record<string, { buy: number, sell: number }> = {
      USD: { buy: 490, sell: 495 },
      EUR: { buy: 550, sell: 560 },
      KZT: { buy: 1, sell: 1 } // Base currency
    }
    
    $('.informer tbody tr').each((i, el) => {
      const tds = $(el).find('td')
      if (tds.length === 3) {
        const currency = $(tds[0]).text().trim()
        const buy = parseFloat($(tds[1]).text().trim())
        const sell = parseFloat($(tds[2]).text().trim())
        
        if (currency && !isNaN(buy) && !isNaN(sell)) {
          rates[currency] = { buy, sell }
        }
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      base: 'KZT',
      rates: {
        USD: rates.USD,
        EUR: rates.EUR,
        // Calculate the rate relative to USD since our DB values are stored assuming USD
        // 1 USD = X KZT 
        // 1 EUR = Y KZT
      }
    })
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rates', rates: { USD: { sell: 495 }, EUR: { sell: 560 } } },
      { status: 500 }
    )
  }
}
