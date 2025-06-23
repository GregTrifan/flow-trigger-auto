<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use App\Models\Flow;
use App\Jobs\RunFlow;

class ContactController extends Controller
{
    private const MAX_NAME_LENGTH = 100;
    private const MAX_EMAIL_LENGTH = 100;
    private const MAX_PHONE_LENGTH = 20;
    private const MIN_PHONE_LENGTH = 10;

    /**
     * Handle contact form submission.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function __invoke(Request $request)
    {
        $validated = $this->validateRequest($request);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }
        return $this->processContactSubmission($validated);
    }

    /**
     * Validate the incoming request.
     *
     * @param  Request  $request
     * @return array|JsonResponse
     */
    private function validateRequest(Request $request)
    {
        try {
            return $request->validate(
                $this->validationRules(),
                $this->validationMessages()
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Get the validation rules.
     *
     * @return array
     */
    private function validationRules(): array
    {
        $request = request();
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:' . self::MAX_NAME_LENGTH,
                'regex:/^[\pL\s\-\'\"]+$/u'
            ],
            'email' => [
                'required_without:phone',
                'nullable',
                'email:rfc,dns',
                'max:' . self::MAX_EMAIL_LENGTH,
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                Rule::requiredIf(function () use ($request) {
                    return empty($request->phone);
                })
            ],
            'phone' => [
                'required_without:email',
                'nullable',
                'string',
                'min:' . self::MIN_PHONE_LENGTH,
                'max:' . self::MAX_PHONE_LENGTH,
                'regex:/^\+[1-9]\d{9,14}$/',
                Rule::requiredIf(function () use ($request) {
                    return empty($request->email);
                })
            ]
        ];
    }

    /**
     * Get the validation error messages.
     *
     * @return array
     */
    private function validationMessages(): array
    {
        return [
            'name.required' => 'Please provide your name.',
            'name.min' => 'Your name should be at least 2 characters.',
            'name.max' => 'Your name may not exceed ' . self::MAX_NAME_LENGTH . ' characters.',
            'name.regex' => 'Please enter a valid name with only letters and basic punctuation.',
            'email.required_without' => 'Please provide either an email or phone number.',
            'email.email' => 'Please enter a valid email address.',
            'email.regex' => 'The email format is invalid. Example: name@example.com',
            'email.max' => 'Email may not exceed ' . self::MAX_EMAIL_LENGTH . ' characters.',
            'email.required_if' => 'Email is required when phone is not provided.',
            'phone.required_without' => 'Please provide either a phone number or email.',
            'phone.regex' => 'Please enter a valid phone number in international format (e.g., +4074942XXXX).',
            'phone.min' => 'Phone number must be at least ' . self::MIN_PHONE_LENGTH . ' digits.',
            'phone.max' => 'Phone number may not exceed ' . self::MAX_PHONE_LENGTH . ' characters.',
            'phone.required_if' => 'Phone number is required when email is not provided.'
        ];
    }

    /**
     * Process the contact form submission.
     *
     * @param  array  $validatedData
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    private function processContactSubmission(array $validatedData)
    {
        try {
            $contactData = [
                'name' => e($validatedData['name']),
                'email' => isset($validatedData['email']) ? strtolower(trim($validatedData['email'])) : null,
                'phone' => isset($validatedData['phone']) ? preg_replace('/[^\d+]/', '', $validatedData['phone']) : null,
            ];
            $contact = Contact::create($contactData);
            $flow = Flow::where('is_active', true)
                        ->whereHas('nodes', function ($query) {
                            $query->where('type', 'trigger')
                                  ->where('subtype', 'form_submit');
                        })
                        ->first();
            if ($flow) {
                RunFlow::dispatch($flow, $contact);
                Log::info('Dispatched job to run flow for new contact', [
                    'flow_id' => $flow->id,
                    'contact_id' => $contact->id,
                ]);
            }
            Log::info('New contact form submission', [
                'contact_id' => $contact->id,
                'email' => $contact->email,
                'ip' => request()->ip()
            ]);
            $response = [
                'success' => true,
                'message' => 'Thank you for reaching out! We\'ll get back to you shortly.',
                'data' => [
                    'name' => $contact->name,
                    'contact_method' => $contact->email ? 'email' : 'phone'
                ]
            ];
            return request()->wantsJson()
                ? response()->json($response)
                : back()->with($response);
        } catch (\Exception $e) {
            Log::error('Contact submission failed: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $validatedData,
                'trace' => $e->getTraceAsString()
            ]);
            $errorMessage = 'We encountered an issue while processing your request. Please try again later.';
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => $errorMessage,
                    'error' => config('app.debug') ? $e->getMessage() : null
                ], 500);
            }
            return back()
                ->withInput()
                ->withErrors(['contact' => $errorMessage]);
        }
    }
}
