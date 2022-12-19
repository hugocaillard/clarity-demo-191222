(define-constant FORBIDDEN (err u1001))
(define-constant INVALID_CHOICE (err u1002))
(define-constant VOTE_ENDED (err u1003))

(define-constant VOTE_END (+ block-height u2016))

(define-map votes principal (string-ascii 6))

(define-data-var apple-votes uint u0)
(define-data-var orange-votes uint u0)

(define-read-only (get-results)
  (ok {
    apple: (var-get apple-votes),
    orange: (var-get orange-votes),
  })
)

(define-public (vote (pick (string-ascii 6)))
  (begin
    (asserts! (< block-height VOTE_END) VOTE_ENDED)
    (asserts! (is-none (map-get? votes tx-sender)) FORBIDDEN)
    (asserts! (or (is-eq pick "apple") (is-eq pick "orange")) INVALID_CHOICE)

    (if (is-eq pick "apple")
      (var-set apple-votes (+ (var-get apple-votes) u1))
      (var-set orange-votes (+ (var-get orange-votes) u1))
    )

    (map-insert votes tx-sender pick)

    (ok true)
  )
)
