* Hypothesis Testing
  - Purpose  
    Hypothesis testing aims to determine whether a hypothesis about $H_0$ a population parameter is supported by empirical evidence.

    - Null Hypothesis $H_0$, is a statement that assumes there is no significant difference or relationship between two variables, or that a population parameter is equal to a specific value.  

    - Alternate Hypothesis $H_1$, is a statement that contradicts the null hypothesis.

  - Process
    - State the null hypothesis $H_0$ and alternative hypothesis $H_1$, 
    - Select a test statistic and set the level of significance
      - Level of Significance  
        Level of Significance is a predetermined threshold that represents the maximum probability of accepting a false null hypothesis.
      - Test Statistic  
        Test Statistic is a numerical value calculated from the sample data that is used to compare the observed deviation from the null hypothesis.

    - Calculate the p-value and Make a decision,
      - P-value, is the probability under the null hypothesis of obtaining a real-valued test statistic at least as extreme as the one obtained.
      - Rejection Region

  - Include 
    * Z-tests
      $$Z = \frac{\bar X - \mu_0}{\sigma / \sqrt{n}}  \tag{Z-test statistic}$$ 

      Z-test is used when the population standard deviation $\sigma^2$ is unknown, and the sample size is large (typically greater than 30). It is used to test whether the mean of a sample $\mu$ is significantly different from a known population mean $\mu_0$.

    * t-tests
      $$t = \frac{\bar X - \mu_0}{s / \sqrt{n}}  \tag{t-test statistic}$$ 

      t-test is used when the population standard deviation $\sigma^2$ is unknown and the sample size is small (typically less than 30). It is used to test whether the mean $\mu$ of a sample is significantly different from a hypothesized population mean $\mu_0$.

    * F-tests
      $$F = \frac{s_1^2}{s_2^2}  \tag{F-test statistic}$$
      F-test is used to compare the variances of two populations, to test whether the variances of two samples are significantly different.
      
    * $\chi^2$-tests  
      $$\chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i} = \sum_{i=1}^{k} \frac{f_i^2}{n p_i} - n  \tag{$\chi^2$-test statistic}$$

      $\chi^2$-test is used to test whether there is a significant association between two categorical variables. It is used to test whether the observed frequencies of the categories in a sample are significantly different from the expected frequencies under a given hypothesis. Where $O_i$ is the observed frequency in category $i$, $E_i$ is the expected frequency in category $i$, and $k$ is the number of categories being compared.

    * Unit Root Test
