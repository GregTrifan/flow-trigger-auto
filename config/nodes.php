<?php

return [
    'types' => [
        'trigger' => [
            'label' => 'Trigger',
            'subtypes' => [
                'form_submit' => [
                    'label' => 'Form Submission',
                    'icon' => 'form',
                    'fields' => []
                ]
            ]
        ],
        'action' => [
            'label' => 'Action',
            'subtypes' => [
                'send_email' => [
                    'label' => 'Send Email',
                    'icon' => 'mail',
                    'fields' => [
                        'subject' => [
                            'type' => 'text',
                            'label' => 'Subject',
                            'required' => true,
                        ],
                        'body' => [
                            'type' => 'textarea',
                            'label' => 'Email Body',
                            'required' => true,
                        ]
                    ]
                ],
                'send_sms' => [
                    'label' => 'Send SMS',
                    'icon' => 'message-square',
                    'fields' => [
                        'message' => [
                            'type' => 'textarea',
                            'label' => 'Message',
                            'required' => true,
                        ]
                    ]
                ]
            ]
        ],
        'condition' => [
            'label' => 'Condition',
            'subtypes' => [
                'field_check' => [
                    'label' => 'Check Field',
                    'icon' => 'check',
                    'fields' => [
                        'field_name' => [
                            'type' => 'select',
                            'label' => 'Field to Check',
                            'options' => [
                                'name' => 'Name',
                                'email' => 'Email',
                                'phone' => 'Phone',
                            ],
                            'required' => true,
                        ],
                        'operator' => [
                            'type' => 'select',
                            'label' => 'Condition',
                            'options' => [
                                'exists' => 'Exists (not empty)',
                                'not_exists' => 'Does Not Exist (empty)',
                                'equals' => 'Equals',
                                'not_equals' => 'Does Not Equal',
                                'contains' => 'Contains',
                            ],
                            'required' => true,
                        ],
                        'value' => [
                            'type' => 'text',
                            'label' => 'Value to Compare',
                            'required' => false,
                            'show_when' => [
                                'operator' => ['equals', 'not_equals', 'contains']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'wait' => [
            'label' => 'Wait',
            'subtypes' => [
                'time_delay' => [
                    'label' => 'Time Delay',
                    'icon' => 'clock',
                    'fields' => [
                        'delay_minutes' => [
                            'type' => 'number',
                            'label' => 'Delay (minutes)',
                            'min' => 1,
                            'required' => true,
                        ]
                    ]
                ]
            ]
        ]
    ]
];
