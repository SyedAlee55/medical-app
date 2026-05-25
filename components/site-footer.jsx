export default function SiteFooter({ year }) {
  return (
    <footer className="border-t border-zinc-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-xs text-zinc-400 font-medium">
          {`\u00A9 ${year} Tj\u2019s Medical Hub. Built with care.`}
        </p>
      </div>
    </footer>
  )
}
