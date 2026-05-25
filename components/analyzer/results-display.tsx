import { Building2, Code2, Target, TrendingUp, Mail, Bug, Check, X, ExternalLink, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { AnalysisResult } from "@/lib/types";
import { CATEGORY_COLORS, FIT_COLORS, CONFIDENCE_BADGES } from "./constants";

export function ResultsDisplay({ result }: { result: AnalysisResult }) {
  const fitColors = result.fitScore
    ? FIT_COLORS[result.fitScore.label] || FIT_COLORS.low
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Company Overview */}
      <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border/40">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {result.company.name || "Unknown Company"}
                </CardTitle>
                <CardDescription className="text-sm">
                  <a
                    href={result.input.normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {result.input.normalizedUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={CONFIDENCE_BADGES[result.company.confidence] || ""}
            >
              {result.company.confidence} confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {result.company.description && (
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {result.company.description}
            </p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.company.industry && (
               <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                   Industry
                 </p>
                 <p className="font-medium text-sm">{result.company.industry}</p>
               </div>
            )}
            {result.company.sizeBucket && (
               <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                   Company Size
                 </p>
                 <p className="font-medium text-sm capitalize">
                   {result.company.sizeBucket}
                 </p>
               </div>
            )}
            {result.meta.timingsMs?.total !== undefined && (
               <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                   Analysis Time
                 </p>
                 <p className="font-medium text-sm">
                   {(result.meta.timingsMs.total / 1000).toFixed(1)}s
                 </p>
               </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack + GTM Signals */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-base">Tech Stack</CardTitle>
              <Badge variant="outline" className="ml-auto text-xs">
                {result.techStack.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {result.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.techStack.map((tech, idx) => (
                  <Badge
                    key={`${tech.name}-${idx}`}
                    variant="outline"
                    className={`text-xs font-medium transition-colors ${
                      CATEGORY_COLORS[tech.category] || CATEGORY_COLORS.other
                    }`}
                    title={tech.evidence || tech.category}
                  >
                    {tech.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tech detected
              </p>
            )}
          </CardContent>
        </Card>

        {/* GTM Signals */}
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">GTM Signals</CardTitle>
              <Badge variant="outline" className="ml-auto text-xs">
                {result.gtmSignals.filter((s) => s.value).length}/
                {result.gtmSignals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.gtmSignals.map((signal, idx) => (
                <div
                  key={`${signal.name}-${idx}`}
                  className="flex items-center gap-2 text-sm"
                >
                  {signal.value ? (
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={
                      signal.value
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    }
                  >
                    {signal.name}
                  </span>
                  {signal.evidence && signal.value && (
                    <span className="text-xs text-muted-foreground ml-auto truncate max-w-[200px]">
                      {signal.evidence}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fit Score */}
      {result.fitScore && fitColors && (
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-base">B2B SaaS Fit Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-16 w-16 rounded-2xl ${fitColors.bg} border border-border/40`}
              >
                <span className={`text-2xl font-bold ${fitColors.text}`}>
                  {result.fitScore.score}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={`${fitColors.bg} ${fitColors.text} border-0 uppercase text-xs font-semibold tracking-wider`}
                  >
                    {result.fitScore.label} fit
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {result.fitScore.score}/10
                  </span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${fitColors.bar} transition-all duration-700 ease-out`}
                    style={{
                      width: `${(result.fitScore.score / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-1.5 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Scoring Breakdown
              </p>
              {result.fitScore.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Zap className="h-3.5 w-3.5 mt-0.5 text-amber-400/70 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts (Hunter) */}
      {result.contacts && result.contacts.emails && result.contacts.emails.length > 0 && (
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-base">Contacts</CardTitle>
              <Badge
                variant="outline"
                className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              >
                via Hunter.io
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.contacts.emails.map((email, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono">{email.value}</span>
                    {email.type && (
                      <Badge
                        variant="outline"
                        className="text-[10px] ml-auto"
                      >
                        {email.type}
                      </Badge>
                    )}
                    {email.confidence && (
                      <span className="text-[10px] text-muted-foreground">
                        {email.confidence}%
                      </span>
                    )}
                  </div>
                  {(email.firstName || email.lastName || email.position) && (
                    <div className="flex items-center gap-2 pl-6 mt-1 text-xs text-muted-foreground">
                      {(email.firstName || email.lastName) && (
                        <span className="font-medium text-foreground/80">
                          {[email.firstName, email.lastName].filter(Boolean).join(" ")}
                        </span>
                      )}
                      {(email.firstName || email.lastName) && email.position && <span>•</span>}
                      {email.position && <span className="capitalize">{email.position}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Accordion */}
      {result.debug && (
        <Accordion className="w-full">
          <AccordionItem
            value="debug"
            className="border border-border/30 rounded-xl bg-card/40 backdrop-blur-xl px-4 shadow-lg hover:border-border/50 hover:bg-card/50 transition-all duration-300"
          >
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Debug Information
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 text-sm">
                {result.debug.title && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Page Title
                    </p>
                    <p className="font-mono text-xs bg-muted/20 rounded px-2 py-1">
                      {result.debug.title}
                    </p>
                  </div>
                )}
                {result.debug.metaDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Meta Description
                    </p>
                    <p className="font-mono text-xs bg-muted/20 rounded px-2 py-1">
                      {result.debug.metaDescription}
                    </p>
                  </div>
                )}
                {result.debug.linksSample &&
                  result.debug.linksSample.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Sample Links ({result.debug.linksSample.length})
                      </p>
                      <div className="space-y-1">
                        {result.debug.linksSample.map((link, idx) => (
                          <p
                            key={idx}
                            className="font-mono text-xs bg-muted/20 rounded px-2 py-1 truncate"
                          >
                            {link}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                {result.meta.timingsMs && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Timings
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.meta.timingsMs).map(
                        ([key, val]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className="text-[10px] font-mono"
                          >
                            {key}: {val}ms
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
