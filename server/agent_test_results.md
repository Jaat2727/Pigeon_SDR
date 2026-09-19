# Agent Test Results

## icp_fitment

```json
{
  "_degraded": true,
  "error": "[\n  {\n    \"expected\": \"number\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"fit_score\"\n    ],\n    \"message\": \"Invalid input: expected number, received undefined\"\n  },\n  {\n    \"code\": \"invalid_value\",\n    \"values\": [\n      \"qualify\",\n      \"reject\",\n      \"needs_review\"\n    ],\n    \"path\": [\n      \"verdict\"\n    ],\n    \"message\": \"Invalid option: expected one of \\\"qualify\\\"|\\\"reject\\\"|\\\"needs_review\\\"\"\n  },\n  {\n    \"code\": \"invalid_value\",\n    \"values\": [\n      \"high\",\n      \"medium\",\n      \"low\"\n    ],\n    \"path\": [\n      \"confidence\"\n    ],\n    \"message\": \"Invalid option: expected one of \\\"high\\\"|\\\"medium\\\"|\\\"low\\\"\"\n  },\n  {\n    \"expected\": \"record\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"dimension_scores\"\n    ],\n    \"message\": \"Invalid input: expected record, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"reasoning\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  }\n]",
  "raw": "{\"success\":true,\"thread_id\":\"2d54ad73-6629-43d2-ac22-8c7ac81b7f65\",\"run_id\":\"5916bbbe-dcce-46d5-b6c8-4e69f5edb804\",\"message\":\"Agent run started in background. Use the returned 'thread_id' to track progress.\"}"
}
```

## research

```json
{
  "_degraded": true,
  "error": "[\n  {\n    \"expected\": \"object\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"person\"\n    ],\n    \"message\": \"Invalid input: expected object, received undefined\"\n  },\n  {\n    \"expected\": \"object\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"company\"\n    ],\n    \"message\": \"Invalid input: expected object, received undefined\"\n  },\n  {\n    \"expected\": \"object\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"signals\"\n    ],\n    \"message\": \"Invalid input: expected object, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"research_notes\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"confidence\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  }\n]",
  "raw": "{\"success\":true,\"thread_id\":\"662b089d-2595-475a-927a-64e0b3af0373\",\"run_id\":\"9bf4a477-5a0e-43ba-8bba-dccf00eef4c5\",\"message\":\"Agent run started in background. Use the returned 'thread_id' to track progress.\"}"
}
```

## outreach_strategy

```json
{
  "_degraded": true,
  "error": "[\n  {\n    \"expected\": \"boolean\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"should_contact\"\n    ],\n    \"message\": \"Invalid input: expected boolean, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"no_contact_reason\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"priority\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"array\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"sequence\"\n    ],\n    \"message\": \"Invalid input: expected array, received undefined\"\n  },\n  {\n    \"expected\": \"boolean\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"escalate_to_human\"\n    ],\n    \"message\": \"Invalid input: expected boolean, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"escalation_reason\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"reasoning\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  }\n]",
  "raw": "{\"success\":true,\"thread_id\":\"0c3dcedb-9ad1-4969-aa80-715715840d1d\",\"run_id\":\"100cad8c-455e-49a9-a77e-3635415fc498\",\"message\":\"Agent run started in background. Use the returned 'thread_id' to track progress.\"}"
}
```

## personalisation

```json
{
  "_degraded": true,
  "error": "[\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"channel\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"subject\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"body\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"number\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"word_count\"\n    ],\n    \"message\": \"Invalid input: expected number, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"cta\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"boolean\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"needs_human\"\n    ],\n    \"message\": \"Invalid input: expected boolean, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"needs_human_reason\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"reasoning\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  }\n]",
  "raw": "{\"success\":true,\"thread_id\":\"8e627344-b487-41bb-9da6-0130c3631682\",\"run_id\":\"8d7cb6a3-af11-42d2-8590-0d3a7730a7a4\",\"message\":\"Agent run started in background. Use the returned 'thread_id' to track progress.\"}"
}
```

## conversation

```json
{
  "_degraded": true,
  "error": "[\n  {\n    \"expected\": \"boolean\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"is_human_reply\"\n    ],\n    \"message\": \"Invalid input: expected boolean, received undefined\"\n  },\n  {\n    \"code\": \"invalid_value\",\n    \"values\": [\n      \"interested\",\n      \"meeting_request\",\n      \"question\",\n      \"objection\",\n      \"not_now\",\n      \"not_interested\",\n      \"opt_out\",\n      \"referral\",\n      \"wrong_person\",\n      \"auto_reply\",\n      \"bounce\",\n      \"unclear\"\n    ],\n    \"path\": [\n      \"intent\"\n    ],\n    \"message\": \"Invalid option: expected one of \\\"interested\\\"|\\\"meeting_request\\\"|\\\"question\\\"|\\\"objection\\\"|\\\"not_now\\\"|\\\"not_interested\\\"|\\\"opt_out\\\"|\\\"referral\\\"|\\\"wrong_person\\\"|\\\"auto_reply\\\"|\\\"bounce\\\"|\\\"unclear\\\"\"\n  },\n  {\n    \"expected\": \"number\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"intent_confidence\"\n    ],\n    \"message\": \"Invalid input: expected number, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"sentiment\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"code\": \"invalid_type\",\n    \"expected\": \"nonoptional\",\n    \"path\": [\n      \"referral\"\n    ],\n    \"message\": \"Invalid input: expected nonoptional, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"recommended_action\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"number\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"followup_delay_days\"\n    ],\n    \"message\": \"Invalid input: expected number, received undefined\"\n  },\n  {\n    \"expected\": \"boolean\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"requires_human\"\n    ],\n    \"message\": \"Invalid input: expected boolean, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"escalation_reason\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  },\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"reasoning\"\n    ],\n    \"message\": \"Invalid input: expected string, received undefined\"\n  }\n]",
  "raw": "{\"success\":true,\"thread_id\":\"dfba1643-93b3-4777-bddd-22426114d8b0\",\"run_id\":\"f8942587-eeca-4f31-b61e-0fc5bd955370\",\"message\":\"Agent run started in background. Use the returned 'thread_id' to track progress.\"}"
}
```

