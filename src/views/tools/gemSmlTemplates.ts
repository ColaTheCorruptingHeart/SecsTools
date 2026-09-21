export interface GemSmlTemplate {
  id: string
  group: string
  label: string
  source: string
}

const message = (header: string, body = '.') => `${header}\n${body}`

export const GEM_SML_TEMPLATES: GemSmlTemplate[] = [
  { id: 's1f1', group: 'Communication and Status', label: 'S1F1 — Are You Online?', source: message('S1F1 W') },
  { id: 's1f2', group: 'Communication and Status', label: 'S1F2 — On-Line Data', source: message('S1F2', '<L [2]\n  <A {MDLN} "MODEL_NAME">\n  <A {SOFTREV} "SOFTWARE_REV">\n>.') },
  { id: 's1f3', group: 'Communication and Status', label: 'S1F3 — Selected Equipment Status (Request)', source: message('S1F3 W', '<L [2]\n  <U4 {SVID} 1001>\n  <U4 {SVID} 1002>\n>.') },
  { id: 's1f4', group: 'Communication and Status', label: 'S1F4 — Selected Equipment Status (Data)', source: message('S1F4', '<L [2]\n  <U4 {SV} 1>\n  <A {SV} "IDLE">\n>.') },
  { id: 's1f11', group: 'Communication and Status', label: 'S1F11 — Status Variable Namelist (Request)', source: message('S1F11 W', '<L [2]\n  <U4 {SVID} 1001>\n  <U4 {SVID} 1002>\n>.') },
  { id: 's1f12', group: 'Communication and Status', label: 'S1F12 — Status Variable Namelist', source: message('S1F12', '<L [1]\n  <L [3]\n    <U4 {SVID} 1001>\n    <A {SVNAME} "ControlState">\n    <A {UNITS} "">\n  >\n>.') },
  { id: 's1f13', group: 'Communication and Status', label: 'S1F13 — Establish Communications (Request)', source: message('S1F13 W', '<L [0]>.') },
  { id: 's1f14', group: 'Communication and Status', label: 'S1F14 — Establish Communications (Acknowledge)', source: message('S1F14', '<L [2]\n  <B {COMMACK} 0>\n  <L [2]\n    <A {MDLN} "MODEL_NAME">\n    <A {SOFTREV} "SOFTWARE_REV">\n  >\n>.') },
  { id: 's1f15', group: 'Communication and Status', label: 'S1F15 — Request OFF-LINE', source: message('S1F15 W') },
  { id: 's1f16', group: 'Communication and Status', label: 'S1F16 — OFF-LINE Acknowledge', source: message('S1F16', '<B {OFLACK} 0>.') },
  { id: 's1f17', group: 'Communication and Status', label: 'S1F17 — Request ON-LINE', source: message('S1F17 W') },
  { id: 's1f18', group: 'Communication and Status', label: 'S1F18 — ON-LINE Acknowledge', source: message('S1F18', '<B {ONLACK} 0>.') },

  { id: 's2f13', group: 'Equipment Constants and Events', label: 'S2F13 — Equipment Constant (Request)', source: message('S2F13 W', '<L [2]\n  <U4 {ECID} 1001>\n  <U4 {ECID} 1002>\n>.') },
  { id: 's2f14', group: 'Equipment Constants and Events', label: 'S2F14 — Equipment Constant (Data)', source: message('S2F14', '<L [2]\n  <U4 {ECV} 10>\n  <A {ECV} "AUTO">\n>.') },
  { id: 's2f15', group: 'Equipment Constants and Events', label: 'S2F15 — New Equipment Constant (Send)', source: message('S2F15 W', '<L [1]\n  <L [2]\n    <U4 {ECID} 1001>\n    <U4 {ECV} 20>\n  >\n>.') },
  { id: 's2f16', group: 'Equipment Constants and Events', label: 'S2F16 — New Equipment Constant (Acknowledge)', source: message('S2F16', '<B {EAC} 0>.') },
  { id: 's2f17', group: 'Equipment Constants and Events', label: 'S2F17 — Date and Time (Request)', source: message('S2F17 W') },
  { id: 's2f18', group: 'Equipment Constants and Events', label: 'S2F18 — Date and Time (Data)', source: message('S2F18', '<A {TIME} "2026032514301599">.') },
  { id: 's2f31', group: 'Equipment Constants and Events', label: 'S2F31 — Date and Time Set (Request)', source: message('S2F31 W', '<A {TIME} "2026032514301599">.') },
  { id: 's2f32', group: 'Equipment Constants and Events', label: 'S2F32 — Date and Time Set (Acknowledge)', source: message('S2F32', '<B {TIACK} 0>.') },
  { id: 's2f33', group: 'Equipment Constants and Events', label: 'S2F33 — Define Report', source: message('S2F33 W', '<L [2]\n  <U4 {DATAID} 1>\n  <L [1]\n    <L [2]\n      <U4 {RPTID} 100>\n      <L [2]\n        <U4 {VID} 2001>\n        <U4 {VID} 2002>\n      >\n    >\n  >\n>.') },
  { id: 's2f34', group: 'Equipment Constants and Events', label: 'S2F34 — Define Report (Acknowledge)', source: message('S2F34', '<B {DRACK} 0>.') },
  { id: 's2f35', group: 'Equipment Constants and Events', label: 'S2F35 — Link Event Report', source: message('S2F35 W', '<L [2]\n  <U4 {DATAID} 2>\n  <L [1]\n    <L [2]\n      <U4 {CEID} 3001>\n      <L [1]\n        <U4 {RPTID} 100>\n      >\n    >\n  >\n>.') },
  { id: 's2f36', group: 'Equipment Constants and Events', label: 'S2F36 — Link Event Report (Acknowledge)', source: message('S2F36', '<B {LRACK} 0>.') },
  { id: 's2f37', group: 'Equipment Constants and Events', label: 'S2F37 — Enable/Disable Event Report', source: message('S2F37 W', '<L [2]\n  <BOOLEAN {CEED} TRUE>\n  <L [1]\n    <U4 {CEID} 3001>\n  >\n>.') },
  { id: 's2f38', group: 'Equipment Constants and Events', label: 'S2F38 — Enable/Disable Event Report (Acknowledge)', source: message('S2F38', '<B {ERACK} 0>.') },
  { id: 's2f41', group: 'Equipment Constants and Events', label: 'S2F41 — Host Command (Send)', source: message('S2F41 W', '<L [2]\n  <A {RCMD} "START">\n  <L [1]\n    <L [2]\n      <A {CPNAME} "LOTID">\n      <A {CPVAL} "LOT001">\n    >\n  >\n>.') },
  { id: 's2f42', group: 'Equipment Constants and Events', label: 'S2F42 — Host Command (Acknowledge)', source: message('S2F42', '<L [2]\n  <B {HCACK} 0>\n  <L [0]>\n>.') },

  { id: 's5f1', group: 'Alarms and Data Reports', label: 'S5F1 — Alarm Report (Send)', source: message('S5F1 W', '<L [3]\n  <B {ALCD} 0x81>\n  <U4 {ALID} 1001>\n  <A {ALTX} "Emergency door open">\n>.') },
  { id: 's5f2', group: 'Alarms and Data Reports', label: 'S5F2 — Alarm Report (Acknowledge)', source: message('S5F2', '<B {ACKC5} 0>.') },
  { id: 's5f3', group: 'Alarms and Data Reports', label: 'S5F3 — Enable/Disable Alarm (Send)', source: message('S5F3 W', '<L [2]\n  <B {ALED} 0x80>\n  <U4 {ALID} 1001>\n>.') },
  { id: 's5f4', group: 'Alarms and Data Reports', label: 'S5F4 — Enable/Disable Alarm (Acknowledge)', source: message('S5F4', '<B {ACKC5} 0>.') },
  { id: 's5f5', group: 'Alarms and Data Reports', label: 'S5F5 — List Alarms (Request)', source: message('S5F5 W', '<L [0]>.') },
  { id: 's5f6', group: 'Alarms and Data Reports', label: 'S5F6 — List Alarms (Data)', source: message('S5F6', '<L [1]\n  <L [3]\n    <B {ALCD} 128>\n    <U4 {ALID} 1>\n    <A {ALTX} "ALARM TEXT">\n  >\n>.') },
  { id: 's6f1', group: 'Alarms and Data Reports', label: 'S6F1 — Trace Data (Send)', source: message('S6F1 W', '<L [4]\n  <U4 {TRID} 1>\n  <U4 {SMPLN} 1>\n  <A {STIME} "20260325143000">\n  <L [2]\n    <F4 {SV1} 23.5>\n    <A {SV2} "RUN">\n  >\n>.') },
  { id: 's6f2', group: 'Alarms and Data Reports', label: 'S6F2 — Trace Data (Acknowledge)', source: message('S6F2', '<B {ACKC6} 0>.') },
  { id: 's6f3', group: 'Alarms and Data Reports', label: 'S6F3 — Discrete Variable Data (Send)', source: message('S6F3 W', '<L [3]\n  <U4 {DATAID} 100>\n  <U4 {CEID} 3001>\n  <L [1]\n    <L [2]\n      <A {DSID} "PROCESS_DATA">\n      <L [1]\n        <L [2]\n          <A {DVNAME} "Temperature">\n          <F4 {DVVAL} 25.5>\n        >\n      >\n    >\n  >\n>.') },
  { id: 's6f4', group: 'Alarms and Data Reports', label: 'S6F4 — Discrete Variable Data (Acknowledge)', source: message('S6F4', '<B {ACKC6} 0>.') },
  { id: 's6f11', group: 'Alarms and Data Reports', label: 'S6F11 — Event Report (Send)', source: message('S6F11 W', '<L [3]\n  <U4 {DATAID} 1>\n  <U4 {CEID} 3001>\n  <L [1]\n    <L [2]\n      <U4 {RPTID} 100>\n      <L [1]\n        <U4 {V} 0>\n      >\n    >\n  >\n>.') },
  { id: 's6f12', group: 'Alarms and Data Reports', label: 'S6F12 — Event Report (Acknowledge)', source: message('S6F12', '<B {ACKC6} 0>.') },

  { id: 's7f3', group: 'Process Programs and Terminal', label: 'S7F3 — Process Program (Send)', source: message('S7F3 W', '<L [2]\n  <A {PPID} "PP001">\n  <B {PPBODY} 01 02 03 04 05 06>\n>.') },
  { id: 's7f4', group: 'Process Programs and Terminal', label: 'S7F4 — Process Program (Acknowledge)', source: message('S7F4', '<B {ACKC7} 0>.') },
  { id: 's7f5', group: 'Process Programs and Terminal', label: 'S7F5 — Process Program (Request)', source: message('S7F5 W', '<A {PPID} "RECIPE_001">.') },
  { id: 's7f6', group: 'Process Programs and Terminal', label: 'S7F6 — Process Program (Data)', source: message('S7F6', '<L [2]\n  <A {PPID} "PP001">\n  <B {PPBODY} 01 02 03 04 05 06>\n>.') },
  { id: 's7f17', group: 'Process Programs and Terminal', label: 'S7F17 — Delete Process Program', source: message('S7F17 W', '<L [1]\n  <A {PPID} "RECIPE_001">\n>.') },
  { id: 's7f18', group: 'Process Programs and Terminal', label: 'S7F18 — Delete Process Program (Acknowledge)', source: message('S7F18', '<B {ACKC7} 0>.') },
  { id: 's7f19', group: 'Process Programs and Terminal', label: 'S7F19 — Current Process Program (Request)', source: message('S7F19 W') },
  { id: 's7f20', group: 'Process Programs and Terminal', label: 'S7F20 — Current Process Program (Data)', source: message('S7F20', '<A {PPID} "RECIPE_001">.') },
  { id: 's10f3', group: 'Process Programs and Terminal', label: 'S10F3 — Terminal Display (Send)', source: message('S10F3 W', '<L [2]\n  <B {TID} 0>\n  <A {TEXT} "PROCESS COMPLETE">\n>.') },
  { id: 's10f4', group: 'Process Programs and Terminal', label: 'S10F4 — Terminal Display (Acknowledge)', source: message('S10F4', '<B {ACKC10} 0>.') },

  { id: 's9f1', group: 'Protocol Errors', label: 'S9F1 — Unrecognized Device ID', source: message('S9F1', '<B {MHEAD} 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00>.') },
  { id: 's9f3', group: 'Protocol Errors', label: 'S9F3 — Unrecognized Stream', source: message('S9F3', '<B {MHEAD} 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00>.') },
  { id: 's9f5', group: 'Protocol Errors', label: 'S9F5 — Unrecognized Function', source: message('S9F5', '<B {MHEAD} 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00>.') },
  { id: 's9f7', group: 'Protocol Errors', label: 'S9F7 — Illegal Data', source: message('S9F7', '<B {MHEAD} 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00>.') },
  { id: 's9f9', group: 'Protocol Errors', label: 'S9F9 — Transaction Timeout', source: message('S9F9', '<B {SHEAD} 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00>.') }
]
